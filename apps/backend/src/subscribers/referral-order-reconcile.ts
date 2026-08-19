import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { REFERRAL_MODULE } from "../modules/referral"
import type ReferralModuleService from "../modules/referral/service"
import type { ReferralConversionRecord } from "../modules/referral/types"
import { reconcileReferralCommissionWorkflow } from "../workflows/reconcile-referral-commission"

export default async function referralOrderReconcileHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const referralService = container.resolve<ReferralModuleService>(
    REFERRAL_MODULE
  )
  const [conversion] = (await referralService.listReferralConversions({
    order_id: data.id,
  })) as unknown as ReferralConversionRecord[]
  if (!conversion) {
    return
  }

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  try {
    await reconcileReferralCommissionWorkflow(container).run({
      input: { conversion_id: conversion.id },
    })
  } catch (error) {
    logger.error(
      `Failed to reconcile referral commission ${conversion.id}: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

export const config: SubscriberConfig = {
  event: ["order.completed", "order.canceled", "order.updated"],
}
