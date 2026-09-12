"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { revalidateTag } from "next/cache"

import { getAuthHeaders, getCacheTag, getCartId } from "./cookies"
import type { CheckoutResourceResult } from "@lib/types/checkout-resource"
import { reportCheckoutResourceError } from "@lib/util/checkout-error"

export type StoreCreditAccount = {
  id: string
  currency_code: string
  customer_id: string
  credits: number
  debits: number
  balance: number
}

export type CashbackEntry = {
  id: string
  order_id: string
  order_display_id: string
  currency_code: string
  pending_amount: number
  credited_amount: number
  reversed_amount: number
  status:
    | "pending"
    | "available"
    | "partially_reversed"
    | "reversed"
    | "cancelled"
  available_at: string
  created_at: string
}

export async function listStoreCreditAccounts(currencyCode?: string) {
  const headers = await getAuthHeaders()

  if (!headers.authorization) {
    return []
  }

  return sdk.client
    .fetch<{ store_credit_accounts: StoreCreditAccount[] }>(
      "/store/store-credit-accounts",
      {
        method: "GET",
        headers,
        query: currencyCode ? { currency_code: currencyCode } : undefined,
        cache: "no-store",
      }
    )
    .then(({ store_credit_accounts }) => store_credit_accounts)
    .catch(() => [])
}

export async function listStoreCreditAccountsForCheckout(
  currencyCode: string,
  cartId: string,
  countryCode?: string
): Promise<CheckoutResourceResult<StoreCreditAccount[]>> {
  const headers = await getAuthHeaders()

  if (!headers.authorization) {
    return { ok: true, data: [] }
  }

  try {
    const { store_credit_accounts } = await sdk.client.fetch<{
      store_credit_accounts: StoreCreditAccount[]
    }>("/store/store-credit-accounts", {
      method: "GET",
      headers,
      query: { currency_code: currencyCode },
      cache: "no-store",
    })

    return { ok: true, data: store_credit_accounts }
  } catch (error) {
    return {
      ok: false,
      error: reportCheckoutResourceError("store_credit", error, {
        cartId,
        countryCode,
      }),
    }
  }
}

export async function listCashbackEntries() {
  const headers = await getAuthHeaders()

  if (!headers.authorization) {
    return []
  }

  return sdk.client
    .fetch<{ cashback_entries: CashbackEntry[] }>(
      "/store/customers/me/cashback",
      { method: "GET", headers, cache: "no-store" }
    )
    .then(({ cashback_entries }) => cashback_entries)
    .catch(() => [])
}

export async function applyStoreCredit(amount?: number) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No active cart found")
  }

  const headers = await getAuthHeaders()
  await sdk.client
    .fetch(`/store/carts/${cartId}/store-credits`, {
      method: "POST",
      headers,
      body: typeof amount === "number" ? { amount } : {},
    })
    .catch(medusaError)

  revalidateTag(await getCacheTag("carts"))
}
