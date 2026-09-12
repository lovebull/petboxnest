import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils";
import { AFTER_SALES_MODULE } from "../modules/after-sales";
import type AfterSalesModuleService from "../modules/after-sales/service";
import { hashSecret } from "../workflows/after-sales/helpers";
import {
  DAMAGED_CLAIM_WINDOW_DAYS,
  RETURN_WINDOW_DAYS,
  deliveredAtForOrder,
  elapsedCalendarDays,
  isWithinCalendarDays,
  shippedAtForOrder,
} from "../workflows/after-sales/policy";

export const publicRequest = (request: any) => ({
  id: request.id,
  request_number: request.request_number,
  order_id: request.order_id,
  type: request.type,
  status: request.status,
  reason_code: request.reason_code,
  reason_text: request.reason_text,
  customer_note: request.customer_note,
  customer_message: request.customer_message,
  resolution: request.resolution,
  refund_amount: request.refund_amount,
  currency_code: request.currency_code,
  submitted_at: request.submitted_at,
  approved_at: request.approved_at,
  completed_at: request.completed_at,
  created_at: request.created_at,
  updated_at: request.updated_at,
});

export async function requestDetails(scope: any, request: any, admin = false) {
  const service = scope.resolve(AFTER_SALES_MODULE) as AfterSalesModuleService;
  const [items, attachments, history] = await Promise.all([
    service.listAfterSalesItems({ request_id: request.id }),
    service.listAfterSalesAttachments({ request_id: request.id }),
    service.listAfterSalesStatusHistories(
      { request_id: request.id },
      { order: { created_at: "ASC" } },
    ),
  ]);
  return {
    ...(admin ? request : publicRequest(request)),
    items,
    attachments: admin
      ? attachments
      : attachments.map((attachment) => ({
          id: attachment.id,
          url: attachment.url,
          mime_type: attachment.mime_type,
          size: attachment.size,
        })),
    history: history.map((entry) =>
      admin
        ? entry
        : {
            id: entry.id,
            from_status: entry.from_status,
            to_status: entry.to_status,
            note: entry.actor_type === "admin" ? null : entry.note,
            public_note: entry.public_note,
            created_at: entry.created_at,
          },
    ),
  };
}

export async function requireGuestAccess(
  scope: any,
  orderId: string,
  token: string,
) {
  const service = scope.resolve(AFTER_SALES_MODULE) as AfterSalesModuleService;
  const records = await service.listGuestAccessCodes({
    order_id: orderId,
    access_token_hash: hashSecret(token),
  });
  const record = records[0];
  if (
    !record ||
    !record.verified_at ||
    new Date(record.expires_at).getTime() < Date.now()
  ) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "Guest access has expired",
    );
  }
  return record;
}

export async function retrieveOrderForAfterSales(scope: any, orderId: string) {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY);
  const { data } = await query.graph({
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
      "total",
      "items.*",
      "fulfillments.*",
      "fulfillments.labels.*",
      "payment_collections.*",
      "payment_collections.payments.*",
      "payment_collections.payments.refunds.*",
    ],
    filters: { id: orderId },
  });
  if (!data[0])
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Order not found");
  return data[0] as any;
}

export const eligibilityFor = (order: any) => {
  const canceled = Boolean(order.canceled_at || order.status === "canceled");
  const unfulfilled = order.fulfillment_status === "not_fulfilled";
  const delivered = order.fulfillment_status === "delivered";
  const deliveredAt = deliveredAtForOrder(order);
  const shippedAt = shippedAtForOrder(order);
  const withinReturnWindow = isWithinCalendarDays(deliveredAt, RETURN_WINDOW_DAYS);
  const withinDamageWindow = isWithinCalendarDays(
    deliveredAt,
    DAMAGED_CLAIM_WINDOW_DAYS,
  );
  const lostClaimEligible = deliveredAt
    ? elapsedCalendarDays(deliveredAt) >= 2 && withinDamageWindow
    : Boolean(shippedAt && elapsedCalendarDays(shippedAt) >= 7);
  return {
    cancel: !canceled && unfulfilled,
    return: !canceled && delivered && withinReturnWindow,
    exchange: false,
    damaged_claim: !canceled && delivered && withinDamageWindow,
    lost_claim: !canceled && !unfulfilled && lostClaimEligible,
    reasons: {
      cancel: canceled
        ? "Order is already canceled"
        : unfulfilled
          ? null
          : "Order has entered fulfillment",
      return:
        delivered && withinReturnWindow
          ? null
          : deliveredAt
            ? `Returns are available within ${RETURN_WINDOW_DAYS} calendar days of confirmed delivery`
            : "A confirmed delivery time is required before starting a return",
      exchange:
        "Direct exchanges are not offered. Return the eligible item and place a new order.",
      damaged_claim: withinDamageWindow
        ? null
        : `Damage or missing-item claims must be reported within ${DAMAGED_CLAIM_WINDOW_DAYS} calendar days of confirmed delivery`,
      lost_claim:
        deliveredAt && elapsedCalendarDays(deliveredAt) < 2
          ? "Please check the delivery area and allow up to 48 hours"
          : deliveredAt && !withinDamageWindow
            ? `Delivery issues must be reported within ${DAMAGED_CLAIM_WINDOW_DAYS} calendar days of confirmed delivery`
            : !shippedAt && !deliveredAt
              ? "Shipment confirmation is required before reporting a lost package"
              : !lostClaimEligible
                ? "Please allow the carrier more time"
                : null,
    },
  };
};
