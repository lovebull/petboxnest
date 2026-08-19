"use server"

import { sdk } from "@lib/config"
import { revalidateTag } from "next/cache"

import {
  getAuthHeaders,
  getReferralCode,
  removeReferralCode,
} from "./cookies"

export type ReferralParticipant = {
  id: string
  code: string
  is_active: boolean
}

export type ReferralConversion = {
  id: string
  order_display_id: string
  currency_code: string
  commission_amount: number
  credited_amount: number
  reversed_amount: number
  reversal_due: number
  status: "pending" | "paid" | "partially_reversed" | "reversed" | "cancelled"
  available_at: string
  created_at: string
}

export type CommissionLedgerEntry = {
  id: string
  entry_type: "accrual" | "payout" | "reversal" | "adjustment"
  status: "pending" | "posted" | "void"
  amount: number
  currency_code: string
  note: string | null
  created_at: string
}

export type ReferralDashboard = {
  referral_participant: ReferralParticipant | null
  referral_program: {
    commission_percentage: number
    referee_discount_percentage: number
    waiting_days: number
    minimum_order_amount: number
    maximum_commission_amount: number | null
    currency_code: string
  } | null
  referral_conversions: ReferralConversion[]
  commission_ledger: CommissionLedgerEntry[]
}

export async function bindStoredReferralToCart(cartId: string) {
  const code = await getReferralCode()
  if (!code) {
    return null
  }

  const headers = await getAuthHeaders()
  try {
    const result = await sdk.client.fetch<{
      referral_attribution: { id: string }
    }>(`/store/carts/${cartId}/referral`, {
      method: "POST",
      body: { code },
      headers,
    })
    await revalidateTag("carts")
    return result.referral_attribution
  } catch {
    await removeReferralCode()
    return null
  }
}

export async function getReferralDashboard() {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) {
    return null
  }

  return sdk.client
    .fetch<ReferralDashboard>("/store/customers/me/referrals", {
      method: "GET",
      headers,
      cache: "no-store",
    })
    .catch(() => null)
}

export async function activateReferralParticipant() {
  const headers = await getAuthHeaders()
  await sdk.client.fetch("/store/customers/me/referrals/activate", {
    method: "POST",
    headers,
  })
  revalidateTag("referrals")
}
