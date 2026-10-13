import { model } from "@medusajs/framework/utils"

const StorefrontAnalyticsSession = model
  .define(
    {
      tableName: "pbn_storefront_analytics_session",
      name: "StorefrontAnalyticsSession",
    },
    {
      id: model.id({ prefix: "sfses" }).primaryKey(),
      session_id: model.text().unique(),
      visitor_id: model.text(),
      session_day: model.text(),
      started_at: model.dateTime(),
      last_seen_at: model.dateTime(),
      landing_path: model.text().nullable(),
      last_path: model.text().nullable(),
      country_code: model.text().nullable(),
      page_view_count: model.number().default(0),
      product_view_count: model.number().default(0),
      has_added_to_cart: model.boolean().default(false),
      has_started_checkout: model.boolean().default(false),
      has_completed_order: model.boolean().default(false),
      is_returning_visitor: model.boolean().default(false),
      cart_id: model.text().nullable(),
      order_id: model.text().nullable(),
    }
  )
  .indexes([
    {
      name: "IDX_pbn_storefront_session_day",
      on: ["session_day", "started_at"],
    },
    {
      name: "IDX_pbn_storefront_session_visitor",
      on: ["visitor_id", "started_at"],
    },
    {
      name: "IDX_pbn_storefront_session_funnel",
      on: ["has_added_to_cart", "has_started_checkout", "has_completed_order"],
    },
  ])

export default StorefrontAnalyticsSession
