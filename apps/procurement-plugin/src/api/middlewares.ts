import {
  defineMiddlewares,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http"
import {
  ChangePurchaseOrderStatusSchema,
  ProcurementAnalyticsQuerySchema,
  ProcurementListQuerySchema,
  PurchaseOrderSchema,
  RecordPurchasePaymentSchema,
  RecordPurchaseReceiptSchema,
  SupplierSchema,
} from "./validators"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/procurement/orders",
      method: "GET",
      middlewares: [validateAndTransformQuery(ProcurementListQuerySchema, {})],
    },
    {
      matcher: "/admin/procurement/orders",
      method: "POST",
      middlewares: [validateAndTransformBody(PurchaseOrderSchema)],
    },
    {
      matcher: "/admin/procurement/orders/:id",
      method: "POST",
      middlewares: [validateAndTransformBody(PurchaseOrderSchema)],
    },
    {
      matcher: "/admin/procurement/orders/:id/status",
      method: "POST",
      middlewares: [validateAndTransformBody(ChangePurchaseOrderStatusSchema)],
    },
    {
      matcher: "/admin/procurement/orders/:id/payments",
      method: "POST",
      middlewares: [validateAndTransformBody(RecordPurchasePaymentSchema)],
    },
    {
      matcher: "/admin/procurement/orders/:id/receipts",
      method: "POST",
      middlewares: [validateAndTransformBody(RecordPurchaseReceiptSchema)],
    },
    {
      matcher: "/admin/procurement/suppliers",
      method: "GET",
      middlewares: [validateAndTransformQuery(ProcurementListQuerySchema, {})],
    },
    {
      matcher: "/admin/procurement/suppliers",
      method: "POST",
      middlewares: [validateAndTransformBody(SupplierSchema)],
    },
    {
      matcher: "/admin/procurement/suppliers/:id",
      method: "POST",
      middlewares: [validateAndTransformBody(SupplierSchema)],
    },
    {
      matcher: "/admin/procurement/analytics",
      method: "GET",
      middlewares: [validateAndTransformQuery(ProcurementAnalyticsQuerySchema, {})],
    },
  ],
})
