import { createHash } from "node:crypto";
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils";
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { SALES_ANALYTICS_MODULE } from "../modules/sales-analytics";
import type SalesAnalyticsModuleService from "../modules/sales-analytics/service";

export const STOREFRONT_ANALYTICS_EVENT_TYPES = [
  "page_view",
  "product_view",
  "add_to_cart",
  "checkout_started",
  "order_completed",
] as const;

export type StorefrontAnalyticsEventType =
  (typeof STOREFRONT_ANALYTICS_EVENT_TYPES)[number];

export type RecordStorefrontAnalyticsEventInput = {
  event_id: string;
  event_type: StorefrontAnalyticsEventType;
  visitor_id: string;
  session_id: string;
  path?: string | null;
  country_code?: string | null;
  product_id?: string | null;
  variant_id?: string | null;
  cart_id?: string | null;
  order_id?: string | null;
  request_ip?: string | null;
};

type RecordStorefrontAnalyticsEventOutput = {
  accepted: boolean;
  duplicate: boolean;
  event_id: string;
};

type CompensationInput = null | {
  event_record_id: string;
  session_record_id: string;
  created_session: boolean;
  previous_session: Record<string, unknown> | null;
};

const utcDay = (date: Date) => date.toISOString().slice(0, 10);

const hashIpAddress = (value?: string | null) => {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return null;
  return createHash("sha256")
    .update(
      `${process.env.COOKIE_SECRET || "petboxnest-analytics"}:${normalized}`,
    )
    .digest("hex");
};

const recordStorefrontAnalyticsEventStep = createStep<
  RecordStorefrontAnalyticsEventInput,
  RecordStorefrontAnalyticsEventOutput,
  CompensationInput
>(
  "record-storefront-analytics-event",
  async (input: RecordStorefrontAnalyticsEventInput, { container }) => {
    const service = container.resolve<SalesAnalyticsModuleService>(
      SALES_ANALYTICS_MODULE,
    );
    const locking = container.resolve(Modules.LOCKING);
    const lockKey = `sales-analytics:event:${
      input.event_type === "order_completed" && input.order_id
        ? `order:${input.order_id}`
        : input.event_id
    }`;
    await locking.acquire(lockKey, { expire: 15 });

    try {
      const duplicate = (
        await service.listStorefrontAnalyticsEvents({
          event_id: input.event_id,
        })
      )[0];

      if (duplicate) {
        return new StepResponse(
          { accepted: true, duplicate: true, event_id: input.event_id },
          null,
        );
      }

      const currentSession = (
        await service.listStorefrontAnalyticsSessions({
          session_id: input.session_id,
        })
      )[0];

      if (currentSession && currentSession.visitor_id !== input.visitor_id) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Analytics session does not belong to this visitor",
        );
      }

      if (input.event_type === "order_completed") {
        if (!input.order_id) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            "order_id is required for an order_completed event",
          );
        }
        const existingOrderEvent = (
          await service.listStorefrontAnalyticsEvents({
            event_type: "order_completed",
            order_id: input.order_id,
          })
        )[0];
        if (existingOrderEvent) {
          return new StepResponse(
            { accepted: true, duplicate: true, event_id: input.event_id },
            null,
          );
        }
        const query = container.resolve(ContainerRegistrationKeys.QUERY);
        const { data: orders } = await query.graph({
          entity: "order",
          fields: ["id"],
          filters: { id: input.order_id },
        });
        if (!orders[0]) {
          throw new MedusaError(
            MedusaError.Types.NOT_FOUND,
            "Order not found for analytics event",
          );
        }
        if (currentSession?.cart_id) {
          const { data: carts } = await query.graph({
            entity: "cart",
            fields: ["id", "payment_collection.order.id"],
            filters: { id: currentSession.cart_id },
          });
          const linkedOrderId = (
            carts[0] as {
              payment_collection?: { order?: { id?: string } };
            }
          )?.payment_collection?.order?.id;
          if (linkedOrderId && linkedOrderId !== input.order_id) {
            throw new MedusaError(
              MedusaError.Types.NOT_ALLOWED,
              "Order does not belong to this analytics session",
            );
          }
        }
      }

      const now = new Date();
      const minuteAgo = new Date(now.getTime() - 60_000);
      const requestIpHash = hashIpAddress(input.request_ip);
      const [[, sessionCount], [, visitorCount], ipResult] = await Promise.all([
        service.listAndCountStorefrontAnalyticsEvents(
          {
            session_id: input.session_id,
            occurred_at: { $gte: minuteAgo },
          },
          { take: 1 },
        ),
        service.listAndCountStorefrontAnalyticsEvents(
          {
            visitor_id: input.visitor_id,
            occurred_at: { $gte: minuteAgo },
          },
          { take: 1 },
        ),
        requestIpHash
          ? service.listAndCountStorefrontAnalyticsEvents(
              {
                request_ip_hash: requestIpHash,
                occurred_at: { $gte: minuteAgo },
              },
              { take: 1 },
            )
          : Promise.resolve([[], 0] as [never[], number]),
      ]);
      const ipCount = ipResult[1];

      if (sessionCount >= 60 || visitorCount >= 120 || ipCount >= 240) {
        throw new MedusaError(
          MedusaError.Types.NOT_ALLOWED,
          "Analytics event rate limit exceeded",
        );
      }

      const event = await service.createStorefrontAnalyticsEvents({
        event_id: input.event_id,
        event_type: input.event_type,
        visitor_id: input.visitor_id,
        session_id: input.session_id,
        event_day: utcDay(now),
        occurred_at: now,
        path: input.path || null,
        country_code: input.country_code || null,
        product_id: input.product_id || null,
        variant_id: input.variant_id || null,
        cart_id: input.cart_id || null,
        order_id: input.order_id || null,
        request_ip_hash: requestIpHash,
        deduplication_key:
          input.event_type === "order_completed" && input.order_id
            ? `order:${input.order_id}`
            : null,
      });

      const previousVisitorSession = currentSession
        ? null
        : (
            await service.listStorefrontAnalyticsSessions(
              { visitor_id: input.visitor_id },
              { take: 1, order: { started_at: "ASC" } },
            )
          )[0];

      const sessionValues = {
        visitor_id: input.visitor_id,
        session_day: currentSession?.session_day || utcDay(now),
        started_at: currentSession?.started_at || now,
        last_seen_at: now,
        landing_path: currentSession?.landing_path || input.path || null,
        last_path: input.path || currentSession?.last_path || null,
        country_code:
          input.country_code || currentSession?.country_code || null,
        page_view_count:
          Number(currentSession?.page_view_count || 0) +
          (input.event_type === "page_view" ? 1 : 0),
        product_view_count:
          Number(currentSession?.product_view_count || 0) +
          (input.event_type === "product_view" ? 1 : 0),
        has_added_to_cart:
          Boolean(currentSession?.has_added_to_cart) ||
          input.event_type === "add_to_cart",
        has_started_checkout:
          Boolean(currentSession?.has_started_checkout) ||
          input.event_type === "checkout_started",
        has_completed_order:
          Boolean(currentSession?.has_completed_order) ||
          input.event_type === "order_completed",
        is_returning_visitor:
          Boolean(currentSession?.is_returning_visitor) ||
          Boolean(previousVisitorSession),
        cart_id: input.cart_id || currentSession?.cart_id || null,
        order_id: input.order_id || currentSession?.order_id || null,
      };

      const session = currentSession
        ? await service.updateStorefrontAnalyticsSessions({
            id: currentSession.id,
            ...sessionValues,
          })
        : await service.createStorefrontAnalyticsSessions({
            session_id: input.session_id,
            ...sessionValues,
          });

      const compensation: CompensationInput = {
        event_record_id: event.id,
        session_record_id: session.id,
        created_session: !currentSession,
        previous_session: currentSession
          ? {
              id: currentSession.id,
              last_seen_at: currentSession.last_seen_at,
              last_path: currentSession.last_path,
              country_code: currentSession.country_code,
              page_view_count: currentSession.page_view_count,
              product_view_count: currentSession.product_view_count,
              has_added_to_cart: currentSession.has_added_to_cart,
              has_started_checkout: currentSession.has_started_checkout,
              has_completed_order: currentSession.has_completed_order,
              is_returning_visitor: currentSession.is_returning_visitor,
              cart_id: currentSession.cart_id,
              order_id: currentSession.order_id,
            }
          : null,
      };

      return new StepResponse(
        { accepted: true, duplicate: false, event_id: event.event_id },
        compensation,
      );
    } finally {
      await locking.release(lockKey);
    }
  },
  async (compensation: CompensationInput | undefined, { container }) => {
    if (!compensation) return;
    const service = container.resolve<SalesAnalyticsModuleService>(
      SALES_ANALYTICS_MODULE,
    );
    await service.deleteStorefrontAnalyticsEvents(compensation.event_record_id);
    if (compensation.created_session) {
      await service.deleteStorefrontAnalyticsSessions(
        compensation.session_record_id,
      );
    } else if (compensation.previous_session) {
      await service.updateStorefrontAnalyticsSessions(
        compensation.previous_session as { id: string },
      );
    }
  },
);

export const recordStorefrontAnalyticsEventWorkflow = createWorkflow(
  "record-storefront-analytics-event-workflow",
  function (input: RecordStorefrontAnalyticsEventInput) {
    const result = recordStorefrontAnalyticsEventStep(input);
    return new WorkflowResponse(result);
  },
);
