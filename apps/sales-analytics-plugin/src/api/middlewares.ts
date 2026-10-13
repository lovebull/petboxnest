import {
  defineMiddlewares,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http"
import {
  CommerceAnalyticsQuerySchema,
  SalesAnalyticsQuerySchema,
  SalesOrdersQuerySchema,
  SalesAnalyticsSettingsSchema,
  StorefrontAnalyticsEventSchema,
} from "./validators"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/sales-analytics",
      method: "GET",
      middlewares: [validateAndTransformQuery(SalesAnalyticsQuerySchema, {})],
    },
    {
      matcher: "/admin/sales-analytics/orders",
      method: "GET",
      middlewares: [validateAndTransformQuery(SalesOrdersQuerySchema, {})],
    },
    {
      matcher: "/admin/commerce-analytics",
      method: "GET",
      middlewares: [validateAndTransformQuery(CommerceAnalyticsQuerySchema, {})],
    },
    {
      matcher: "/admin/commerce-analytics/settings",
      method: "POST",
      middlewares: [validateAndTransformBody(SalesAnalyticsSettingsSchema)],
    },
    {
      matcher: "/store/analytics/events",
      method: "POST",
      middlewares: [validateAndTransformBody(StorefrontAnalyticsEventSchema)],
    },
  ],
})
