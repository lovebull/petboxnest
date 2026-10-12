import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { syncSalesOrderWorkflow } from "../workflows"

export default async function paymentRefundedSalesAnalyticsHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: payments } = await query.graph({
    entity: "payment",
    fields: ["id", "payment_collection.order.id"],
    filters: { id: data.id },
  })
  const orderId = (payments[0] as { payment_collection?: { order?: { id?: string } } })
    ?.payment_collection?.order?.id
  if (!orderId) return
  await syncSalesOrderWorkflow(container).run({ input: { order_id: orderId } })
}

export const config: SubscriberConfig = { event: "payment.refunded" }
