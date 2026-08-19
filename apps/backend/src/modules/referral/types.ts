export type ReferralProgramRecord = {
  id: string
  key: string
  name: string
  is_active: boolean
  commission_percentage: number
  referee_discount_percentage: number
  promotion_code: string
  promotion_id: string | null
  currency_code: string
  minimum_order_amount: number
  maximum_commission_amount: number | null
  waiting_days: number
  attribution_days: number
  stack_with_cashback: boolean
}

export type ReferralParticipantRecord = {
  id: string
  customer_id: string
  code: string
  is_active: boolean
  created_at: Date | string
}

export type ReferralAttributionRecord = {
  id: string
  participant_id: string
  referrer_customer_id: string
  referred_customer_id: string | null
  cart_id: string
  code: string
  status: "active" | "converted" | "expired" | "rejected"
  expires_at: Date | string
  converted_at: Date | string | null
  rejection_reason: string | null
}

export type ReferralRuleSnapshot = {
  commission_percentage: number
  referee_discount_percentage: number
  promotion_code: string
  currency_code: string
  minimum_order_amount: number
  maximum_commission_amount: number | null
  waiting_days: number
  stack_with_cashback: boolean
}

export type ReferralConversionRecord = {
  id: string
  order_id: string
  order_display_id: string
  attribution_id: string
  participant_id: string
  referrer_customer_id: string
  referred_customer_id: string
  currency_code: string
  eligible_amount: number
  commission_amount: number
  credited_amount: number
  reversed_amount: number
  reversal_due: number
  status: "pending" | "paid" | "partially_reversed" | "reversed" | "cancelled"
  available_at: Date | string
  paid_at: Date | string | null
  store_credit_account_id: string | null
  rule_snapshot: ReferralRuleSnapshot
}

export type CommissionLedgerEntryRecord = {
  id: string
  conversion_id: string
  participant_id: string
  customer_id: string
  order_id: string
  entry_type: "accrual" | "payout" | "reversal" | "adjustment"
  status: "pending" | "posted" | "void"
  amount: number
  currency_code: string
  available_at: Date | string | null
  posted_at: Date | string | null
  store_credit_transaction_id: string | null
  idempotency_key: string
  note: string | null
  created_at: Date | string
}
