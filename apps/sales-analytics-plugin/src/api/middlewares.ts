import { defineMiddlewares, validateAndTransformQuery } from "@medusajs/framework/http"
import { SalesAnalyticsQuerySchema, SalesOrdersQuerySchema } from "./validators"

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
  ],
})
