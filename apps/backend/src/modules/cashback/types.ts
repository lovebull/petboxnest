import type { BigNumberValue } from "@medusajs/framework/types"

export type CashbackRewardType = "percentage" | "fixed"

export type CashbackStatus =
  | "pending"
  | "available"
  | "partially_reversed"
  | "reversed"
  | "cancelled"

export type CashbackRuleSnapshot = {
  name: string
  reward_type: CashbackRewardType
  reward_value: number
  currency_code: string
  minimum_order_amount: number
  maximum_cashback_amount: number | null
  waiting_days: number
}

export type CashbackRuleRecord = {
  id: string
  key: string
  name: string
  is_active: boolean
  reward_type: CashbackRewardType
  reward_value: BigNumberValue
  currency_code: string
  minimum_order_amount: BigNumberValue
  maximum_cashback_amount: BigNumberValue | null
  waiting_days: number
  starts_at: Date | string | null
  ends_at: Date | string | null
  metadata?: Record<string, unknown> | null
  created_at: Date | string
  updated_at: Date | string
}

export type CashbackEntryRecord = {
  id: string
  order_id: string
  order_display_id: string
  customer_id: string
  rule_id: string
  currency_code: string
  eligible_amount: BigNumberValue
  pending_amount: BigNumberValue
  credited_amount: BigNumberValue
  reversed_amount: BigNumberValue
  reversal_due: BigNumberValue
  status: CashbackStatus
  available_at: Date | string
  released_at: Date | string | null
  store_credit_account_id: string | null
  store_credit_transaction_id: string | null
  reversal_transaction_id: string | null
  rule_snapshot: CashbackRuleSnapshot
  metadata?: Record<string, unknown> | null
  created_at: Date | string
  updated_at: Date | string
}
