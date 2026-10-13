import { model } from "@medusajs/framework/utils";

const StorefrontAnalyticsEvent = model
  .define(
    {
      tableName: "pbn_storefront_analytics_event",
      name: "StorefrontAnalyticsEvent",
    },
    {
      id: model.id({ prefix: "sfevt" }).primaryKey(),
      event_id: model.text().unique(),
      event_type: model.enum([
        "page_view",
        "product_view",
        "add_to_cart",
        "checkout_started",
        "order_completed",
      ]),
      visitor_id: model.text(),
      session_id: model.text(),
      event_day: model.text(),
      occurred_at: model.dateTime(),
      path: model.text().nullable(),
      country_code: model.text().nullable(),
      product_id: model.text().nullable(),
      variant_id: model.text().nullable(),
      cart_id: model.text().nullable(),
      order_id: model.text().nullable(),
      request_ip_hash: model.text().nullable(),
      deduplication_key: model.text().nullable(),
    },
  )
  .indexes([
    {
      name: "IDX_pbn_storefront_event_session_time",
      on: ["session_id", "occurred_at"],
    },
    {
      name: "IDX_pbn_storefront_event_day_type",
      on: ["event_day", "event_type"],
    },
    {
      name: "IDX_pbn_storefront_event_visitor",
      on: ["visitor_id", "occurred_at"],
    },
    {
      name: "IDX_pbn_storefront_event_ip_time",
      on: ["request_ip_hash", "occurred_at"],
    },
    {
      name: "UQ_pbn_storefront_event_deduplication_key",
      on: ["deduplication_key"],
      unique: true,
    },
  ]);

export default StorefrontAnalyticsEvent;
