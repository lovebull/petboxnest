import type { CashbackRuleSnapshot } from "../types"

const roundCurrency = (amount: number) => Math.round(amount * 100) / 100

export const calculateCashback = (
  eligibleAmount: number,
  rule: CashbackRuleSnapshot
) => {
  if (eligibleAmount < rule.minimum_order_amount || eligibleAmount <= 0) {
    return 0
  }

  const calculated =
    rule.reward_type === "percentage"
      ? eligibleAmount * (rule.reward_value / 100)
      : rule.reward_value

  const capped =
    rule.maximum_cashback_amount === null
      ? calculated
      : Math.min(calculated, rule.maximum_cashback_amount)

  return Math.max(0, roundCurrency(capped))
}
