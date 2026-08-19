import type { ReferralRuleSnapshot } from "../types"

export function calculateCommission(
  eligibleAmount: number,
  rule: Pick<
    ReferralRuleSnapshot,
    | "commission_percentage"
    | "minimum_order_amount"
    | "maximum_commission_amount"
  >
) {
  if (eligibleAmount < rule.minimum_order_amount) {
    return 0
  }

  const rawAmount = (eligibleAmount * rule.commission_percentage) / 100
  const cappedAmount =
    rule.maximum_commission_amount === null
      ? rawAmount
      : Math.min(rawAmount, rule.maximum_commission_amount)

  return Math.max(0, Math.round((cappedAmount + Number.EPSILON) * 100) / 100)
}
