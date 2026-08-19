import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { CASHBACK_MODULE } from "../modules/cashback"
import type CashbackModuleService from "../modules/cashback/service"
import type { CashbackEntryRecord } from "../modules/cashback/types"
import { reconcileCashbackWorkflow } from "../workflows/reconcile-cashback"

export default async function cashbackOrderReconcileHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const cashbackService = container.resolve<CashbackModuleService>(
    CASHBACK_MODULE
  )
  const [entry] = (await cashbackService.listCashbackEntries({
    order_id: data.id,
  })) as unknown as CashbackEntryRecord[]

  if (!entry) {
    return
  }

  try {
    await reconcileCashbackWorkflow(container).run({
      input: { entry_id: entry.id },
    })
  } catch (error) {
    logger.error(
      `Failed to reconcile cashback ${entry.id}: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

export const config: SubscriberConfig = {
  event: ["order.completed", "order.canceled", "order.updated"],
}
