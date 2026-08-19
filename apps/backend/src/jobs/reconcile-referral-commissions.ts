import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { REFERRAL_MODULE } from "../modules/referral"
import type ReferralModuleService from "../modules/referral/service"
import type { ReferralConversionRecord } from "../modules/referral/types"
import { reconcileReferralCommissionWorkflow } from "../workflows/reconcile-referral-commission"

export default async function reconcileReferralCommissionsJob(
  container: MedusaContainer
) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const referralService = container.resolve<ReferralModuleService>(
    REFERRAL_MODULE
  )
  const groups = await Promise.all(
    (["pending", "paid", "partially_reversed"] as const).map((status) =>
      referralService.listReferralConversions(
        { status },
        { take: 500, order: { created_at: "ASC" } }
      )
    )
  )
  const conversions = groups.flat() as unknown as ReferralConversionRecord[]

  for (const conversion of conversions) {
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

  logger.info(`Referral reconciliation processed ${conversions.length} conversions.`)
}

export const config = {
  name: "reconcile-referral-commissions-hourly",
  schedule: "15 * * * *",
}
