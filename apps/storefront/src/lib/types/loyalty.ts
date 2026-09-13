import type { HttpTypes } from "@medusajs/types"

export type StoreGiftCard = {
  id: string
  code: string
  status: "pending" | "redeemed"
  value: number
  currency_code: string
  expires_at: string | null
}

export type StoreCartCreditLine = {
  id: string
  amount: number
  reference: string | null
  reference_id: string | null
}

export type LoyaltyStoreCart = HttpTypes.StoreCart & {
  gift_cards?: StoreGiftCard[]
  credit_lines?: StoreCartCreditLine[]
  gift_card_total?: number | null
  gift_card_tax_total?: number | null
}

export type LoyaltyStoreCartResponse = {
  cart: LoyaltyStoreCart
}

export type LoyaltyTotals = {
  credit_lines?: StoreCartCreditLine[] | null
  credit_line_total?: number | null
  gift_card_total?: number | null
}

export const getGiftCards = (cart: HttpTypes.StoreCart) =>
  (cart as LoyaltyStoreCart).gift_cards ?? []

export const getCreditLineAmounts = (totals: LoyaltyTotals) => {
  const creditLines = totals.credit_lines ?? []
  const giftCardFromLines = creditLines
    .filter((line) => line.reference === "gift-card")
    .reduce((total, line) => total + Number(line.amount || 0), 0)
  const storeCredit = creditLines
    .filter((line) => line.reference === "store-credit")
    .reduce((total, line) => total + Number(line.amount || 0), 0)
  const total = Number(totals.credit_line_total || 0)
  const reportedGiftCard =
    giftCardFromLines || Number(totals.gift_card_total || 0)
  const giftCard =
    total > 0 ? Math.min(total, reportedGiftCard) : reportedGiftCard

  return {
    giftCard,
    storeCredit:
      storeCredit +
      (total > 0 ? Math.max(0, total - giftCard - storeCredit) : 0),
  }
}

export const getGiftCardAppliedAmount = (
  cart: HttpTypes.StoreCart,
  giftCardId: string
) =>
  ((cart as LoyaltyStoreCart).credit_lines ?? [])
    .filter(
      (line) =>
        line.reference === "gift-card" && line.reference_id === giftCardId
    )
    .reduce((total, line) => total + Number(line.amount || 0), 0)

export const maskGiftCardCode = (code: string) => {
  const suffix = code.replace(/[^a-zA-Z0-9]/g, "").slice(-4)
  return suffix ? `•••• ${suffix}` : "••••"
}
