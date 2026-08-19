import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { REFERRAL_MODULE } from "../../modules/referral"
import type ReferralModuleService from "../../modules/referral/service"
import type {
  ReferralAttributionRecord,
  ReferralConversionRecord,
  ReferralProgramRecord,
  ReferralRuleSnapshot,
} from "../../modules/referral/types"
import { calculateCommission } from "../../modules/referral/utils/calculate-commission"

type OrderForReferral = {
  id: string
  display_id: string | number
  customer_id?: string | null
  currency_code: string
  item_subtotal: number
  credit_line_total?: number
  metadata?: Record<string, unknown> | null
  created_at: string | Date
}

type CompensationData = {
  conversion_id: string
  ledger_id: string | null
  attribution: ReferralAttributionRecord
}

export const createReferralConversionStep = createStep<
  { order_id: string },
  ReferralConversionRecord | null,
  CompensationData | null
>(
  "create-referral-conversion",
  async ({ order_id }, { container }) => {
    const referralService = container.resolve<ReferralModuleService>(
      REFERRAL_MODULE
    )
    const [existing] = (await referralService.listReferralConversions({
      order_id,
    })) as unknown as ReferralConversionRecord[]
    if (existing) {
      return new StepResponse(existing, null)
    }

    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "customer_id",
        "currency_code",
        "item_subtotal",
        "credit_line_total",
        "metadata",
        "created_at",
      ],
      filters: { id: order_id },
    })
    const order = orders[0] as unknown as OrderForReferral | undefined
    const attributionId = order?.metadata?.referral_attribution_id

    if (!order?.customer_id || typeof attributionId !== "string") {
      return new StepResponse(null, null)
    }

    const [attribution] = (await referralService.listReferralAttributions({
      id: attributionId,
      status: "active",
    })) as ReferralAttributionRecord[]
    const [program] = (await referralService.listReferralPrograms({
      key: "default",
    })) as ReferralProgramRecord[]

    if (
      !attribution ||
      !program ||
      !program.is_active ||
      new Date(attribution.expires_at) <= new Date() ||
      order.metadata?.referral_cart_id !== attribution.cart_id ||
      attribution.referrer_customer_id === order.customer_id
    ) {
      return new StepResponse(null, null)
    }

    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["id", "orders.id"],
      filters: { id: order.customer_id },
    })
    const customer = customers[0] as
      | { orders?: Array<{ id: string }> }
      | undefined
    const hasAnotherOrder = customer?.orders?.some(({ id }) => id !== order.id)
    if (hasAnotherOrder) {
      await referralService.updateReferralAttributions({
        id: attribution.id,
        status: "rejected",
        rejection_reason: "Customer already had an order.",
        referred_customer_id: order.customer_id,
      })
      return new StepResponse(null, null)
    }

    const snapshot: ReferralRuleSnapshot = {
      commission_percentage: Number(program.commission_percentage),
      referee_discount_percentage: Number(program.referee_discount_percentage),
      promotion_code: program.promotion_code,
      currency_code: program.currency_code,
      minimum_order_amount: Number(program.minimum_order_amount),
      maximum_commission_amount:
        program.maximum_commission_amount === null
          ? null
          : Number(program.maximum_commission_amount),
      waiting_days: program.waiting_days,
      stack_with_cashback: program.stack_with_cashback,
    }
    const eligibleAmount = Math.max(
      0,
      Number(order.item_subtotal) - Number(order.credit_line_total || 0)
    )
    const commissionAmount = calculateCommission(eligibleAmount, snapshot)
    const availableAt = new Date(order.created_at)
    availableAt.setUTCDate(availableAt.getUTCDate() + snapshot.waiting_days)

    const conversion = (await referralService.createReferralConversions({
      order_id: order.id,
      order_display_id: String(order.display_id),
      attribution_id: attribution.id,
      participant_id: attribution.participant_id,
      referrer_customer_id: attribution.referrer_customer_id,
      referred_customer_id: order.customer_id,
      currency_code: order.currency_code.toLowerCase(),
      eligible_amount: eligibleAmount,
      commission_amount: commissionAmount,
      credited_amount: 0,
      reversed_amount: 0,
      reversal_due: 0,
      status: commissionAmount > 0 ? "pending" : "cancelled",
      available_at: availableAt,
      rule_snapshot: snapshot,
    })) as unknown as ReferralConversionRecord

    let ledgerId: string | null = null
    if (commissionAmount > 0) {
      const ledger = await referralService.createCommissionLedgerEntries({
        conversion_id: conversion.id,
        participant_id: conversion.participant_id,
        customer_id: conversion.referrer_customer_id,
        order_id: conversion.order_id,
        entry_type: "accrual",
        status: "pending",
        amount: commissionAmount,
        currency_code: conversion.currency_code,
        available_at: availableAt,
        idempotency_key: `${conversion.id}:accrual`,
        note: `Pending referral commission for order #${conversion.order_display_id}`,
      })
      ledgerId = ledger.id
    }

    await referralService.updateReferralAttributions({
      id: attribution.id,
      status: "converted",
      referred_customer_id: order.customer_id,
      converted_at: new Date(),
    })

    return new StepResponse(conversion, {
      conversion_id: conversion.id,
      ledger_id: ledgerId,
      attribution,
    })
  },
  async (data, { container }) => {
    if (!data) {
      return
    }
    const referralService = container.resolve<ReferralModuleService>(
      REFERRAL_MODULE
    )
    if (data.ledger_id) {
      await referralService.deleteCommissionLedgerEntries(data.ledger_id)
    }
    await referralService.deleteReferralConversions(data.conversion_id)
    await referralService.updateReferralAttributions({
      ...data.attribution,
      expires_at: new Date(data.attribution.expires_at),
      converted_at: data.attribution.converted_at
        ? new Date(data.attribution.converted_at)
        : null,
    })
  }
)
