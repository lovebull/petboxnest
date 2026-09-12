import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils";
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { emitEventStep } from "@medusajs/medusa/core-flows";
import { AFTER_SALES_MODULE } from "../../modules/after-sales";
import type AfterSalesModuleService from "../../modules/after-sales/service";
import { hashSecret, normalizeEmail, requestNumber } from "./helpers";
import {
  DAMAGED_CLAIM_WINDOW_DAYS,
  RETURN_WINDOW_DAYS,
  deliveredAtForOrder,
  elapsedCalendarDays,
  isWithinCalendarDays,
  shippedAtForOrder,
} from "./policy";

export type AfterSalesType =
  "cancel" | "return" | "exchange" | "damaged_claim" | "lost_claim";
export type CreateAfterSalesInput = {
  order_id: string;
  customer_id?: string | null;
  guest_access_token?: string;
  type: AfterSalesType;
  reason_code: string;
  reason_text?: string | null;
  customer_note?: string | null;
  items: Array<{
    order_item_id: string;
    quantity: number;
    reason_code?: string;
    exchange_variant_id?: string;
  }>;
  attachment_urls?: Array<{ url: string; mime_type: string; size: number }>;
};

const terminalStatuses = ["rejected", "completed", "cancelled"];

const createRequestStep = createStep(
  "create-request",
  async (input: CreateAfterSalesInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "customer_id",
        "currency_code",
        "status",
        "fulfillment_status",
        "payment_status",
        "canceled_at",
        "created_at",
        "items.*",
        "fulfillments.id",
        "fulfillments.delivered_at",
        "fulfillments.shipped_at",
      ],
      filters: { id: input.order_id },
    });
    const order = orders[0] as any;
    if (!order)
      throw new MedusaError(MedusaError.Types.NOT_FOUND, "Order not found");

    const service =
      container.resolve<AfterSalesModuleService>(AFTER_SALES_MODULE);
    let actorType: "customer" | "guest" = "customer";
    if (input.customer_id) {
      if (order.customer_id !== input.customer_id) {
        throw new MedusaError(
          MedusaError.Types.NOT_ALLOWED,
          "This order does not belong to the customer",
        );
      }
    } else {
      actorType = "guest";
      if (!input.guest_access_token)
        throw new MedusaError(
          MedusaError.Types.UNAUTHORIZED,
          "Guest verification is required",
        );
      const codes = await service.listGuestAccessCodes({
        order_id: order.id,
        email: normalizeEmail(order.email || ""),
        access_token_hash: hashSecret(input.guest_access_token),
      });
      const code = codes[0];
      if (
        !code ||
        !code.verified_at ||
        code.consumed_at ||
        new Date(code.expires_at).getTime() < Date.now()
      ) {
        throw new MedusaError(
          MedusaError.Types.UNAUTHORIZED,
          "Guest access has expired",
        );
      }
    }

    if (order.canceled_at || order.status === "canceled") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Canceled orders are not eligible",
      );
    }
    if (input.type === "exchange") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Direct exchanges are not offered. Please return the eligible item and place a new order.",
      );
    }
    if (
      input.type === "cancel" &&
      !["not_fulfilled", "canceled"].includes(order.fulfillment_status)
    ) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "This order has already entered fulfillment",
      );
    }
    const deliveredAt = deliveredAtForOrder(order);
    if (
      input.type === "return" &&
      (order.fulfillment_status !== "delivered" ||
        !isWithinCalendarDays(deliveredAt, RETURN_WINDOW_DAYS))
    ) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Returns are available within ${RETURN_WINDOW_DAYS} calendar days of confirmed delivery`,
      );
    }
    if (
      input.type === "damaged_claim" &&
      !isWithinCalendarDays(deliveredAt, DAMAGED_CLAIM_WINDOW_DAYS)
    ) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Damage or missing-item claims are available within ${DAMAGED_CLAIM_WINDOW_DAYS} calendar days of confirmed delivery`,
      );
    }
    const shippedAt = shippedAtForOrder(order);
    const lostClaimEligible = deliveredAt
      ? elapsedCalendarDays(deliveredAt) >= 2 &&
        isWithinCalendarDays(deliveredAt, DAMAGED_CLAIM_WINDOW_DAYS)
      : Boolean(shippedAt && elapsedCalendarDays(shippedAt) >= 7);
    if (
      input.type === "lost_claim" &&
      (!lostClaimEligible || order.fulfillment_status === "not_fulfilled")
    ) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "This shipment is not currently eligible for a lost-package claim",
      );
    }
    if (input.type !== "cancel" && !input.items.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Select at least one item",
      );
    }
    if (input.attachment_urls?.length) {
      const publicBase = process.env.S3_FILE_URL?.replace(/\/$/, "")
      if (
        !publicBase ||
        input.attachment_urls.some(
          (attachment) => !attachment.url.startsWith(`${publicBase}/`),
        )
      ) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "An evidence attachment URL is invalid",
        )
      }
    }

    const existing = await service.listAfterSalesRequests({
      order_id: order.id,
    });
    const active = existing.filter(
      (request) => !terminalStatuses.includes(request.status),
    );
    if (input.type === "cancel" && active.length) {
      throw new MedusaError(
        MedusaError.Types.DUPLICATE_ERROR,
        "An after-sales request is already active",
      );
    }

    const orderItems = new Map(
      (order.items || []).map((item: any) => [item.id, item]),
    );
    const existingItems = active.length
      ? await service.listAfterSalesItems({
          request_id: active.map((request) => request.id),
        })
      : [];
    const createdItems = input.items.map((selection) => {
      const item = orderItems.get(selection.order_item_id) as any;
      if (!item)
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "An item does not belong to this order",
        );
      const alreadyRequested = existingItems
        .filter((candidate) => candidate.order_item_id === item.id)
        .reduce((sum, candidate) => sum + candidate.quantity, 0);
      if (
        !Number.isInteger(selection.quantity) ||
        selection.quantity < 1 ||
        selection.quantity + alreadyRequested > item.quantity
      ) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid quantity for ${item.title}`,
        );
      }
      return {
        request_id: "",
        order_item_id: item.id,
        title: item.title,
        thumbnail: item.thumbnail || null,
        quantity: selection.quantity,
        reason_code: selection.reason_code || null,
        exchange_variant_id: selection.exchange_variant_id || null,
        unit_price: Number(item.unit_price || 0),
        refund_amount: Number(item.unit_price || 0) * selection.quantity,
      };
    });

    const now = new Date();
    const request = await service.createAfterSalesRequests({
      request_number: requestNumber(),
      order_id: order.id,
      customer_id: input.customer_id || null,
      customer_email: normalizeEmail(order.email || ""),
      type: input.type,
      status: "pending_review",
      reason_code: input.reason_code,
      reason_text: input.reason_text || null,
      customer_note: input.customer_note || null,
      customer_message: null,
      admin_note: null,
      resolution: null,
      refund_amount:
        createdItems.reduce(
          (sum, item) => sum + Number(item.refund_amount || 0),
          0,
        ) || null,
      currency_code: order.currency_code,
      medusa_return_id: null,
      medusa_exchange_id: null,
      medusa_claim_id: null,
      moderated_by: null,
      submitted_at: now,
      approved_at: null,
      completed_at: null,
    });
    const items = createdItems.length
      ? await service.createAfterSalesItems(
          createdItems.map((item) => ({ ...item, request_id: request.id })),
        )
      : [];
    const attachments = input.attachment_urls?.length
      ? await service.createAfterSalesAttachments(
          input.attachment_urls.map((attachment) => ({
            ...attachment,
            request_id: request.id,
            uploaded_by: input.customer_id || "guest",
          })),
        )
      : [];
    const history = await service.createAfterSalesStatusHistories({
      request_id: request.id,
      from_status: null,
      to_status: "pending_review",
      actor_type: actorType,
      actor_id: input.customer_id || null,
      note: input.customer_note || null,
      public_note: null,
    });
    if (!input.customer_id && input.guest_access_token) {
      const [code] = await service.listGuestAccessCodes({
        access_token_hash: hashSecret(input.guest_access_token),
      });
      if (code)
        await service.updateGuestAccessCodes({ id: code.id, consumed_at: now });
    }
    return new StepResponse({ request, items, attachments, history, order });
  },
  async (result: any, { container }) => {
    if (!result?.request?.id) return;
    const service =
      container.resolve<AfterSalesModuleService>(AFTER_SALES_MODULE);
    await service.deleteAfterSalesStatusHistories(result.history.id);
    if (result.attachments?.length)
      await service.deleteAfterSalesAttachments(
        result.attachments.map((item: any) => item.id),
      );
    if (result.items?.length)
      await service.deleteAfterSalesItems(
        result.items.map((item: any) => item.id),
      );
    await service.deleteAfterSalesRequests(result.request.id);
  },
);

export const createAfterSalesRequestWorkflow = createWorkflow(
  "create-after-sales-request",
  function (input: CreateAfterSalesInput) {
    const result = createRequestStep(input);
    emitEventStep({ eventName: "after_sales.requested", data: result });
    return new WorkflowResponse(result);
  },
);
