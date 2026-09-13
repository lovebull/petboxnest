import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { RESTOCK_MODULE } from "../modules/restock"
import type RestockModuleService from "../modules/restock/service"
import { sendRestockNotificationWorkflow } from "../workflows/restock/send-restock-notification"

export default async function restockNotificationsJob(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service = container.resolve<RestockModuleService>(RESTOCK_MODULE)
  const subscriptions = await service.listRestockSubscriptions({ status: "active", consent_given: true }, { take: 500, order: { created_at: "ASC" } })
  let sent = 0
  for (const subscription of subscriptions) {
    try {
      const [lastLog] = await service.listRestockNotificationLogs({ subscription_id: subscription.id }, { take: 1, order: { created_at: "DESC" } })
      if (lastLog?.status === "failed" && lastLog.next_retry_at && new Date(lastLog.next_retry_at) > new Date()) continue
      const { result } = await sendRestockNotificationWorkflow(container).run({ input: { subscription_id: subscription.id } })
      if ((result as any).sent) sent++
    } catch (error) {
      logger.error(`Restock notification failed for ${subscription.id}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  logger.info(`Restock check processed ${subscriptions.length} subscriptions; ${sent} notifications sent.`)
}

export const config = { name: "petboxnest-restock-notifications", schedule: "0 * * * *" }
