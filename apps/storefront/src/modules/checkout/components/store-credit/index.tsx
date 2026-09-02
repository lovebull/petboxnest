"use client"

import { applyStoreCredit, StoreCreditAccount } from "@lib/data/store-credit"
import { convertToLocale } from "@lib/util/money"
import { Button, Heading, Input, Text } from "@modules/common/components/ui"
import { HttpTypes } from "@medusajs/types"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function StoreCredit({
  cart,
  account,
}: {
  cart: HttpTypes.StoreCart
  account: StoreCreditAccount
}) {
  const router = useRouter()
  const currentCredit = Number(cart.credit_line_total || 0)
  const maximum = Math.min(
    Number(account.balance),
    currentCredit + Number(cart.total || 0)
  )
  const [amount, setAmount] = useState(maximum.toFixed(2))
  const [isApplying, setIsApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apply = async () => {
    const value = Number(amount)
    if (!Number.isFinite(value) || value < 0 || value > maximum) {
      setError(`Enter an amount between 0 and ${maximum.toFixed(2)}.`)
      return
    }

    setIsApplying(true)
    setError(null)
    try {
      await applyStoreCredit(value)
      router.refresh()
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to apply store credit."
      )
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <section className="rounded-[24px] border border-[#E6E8EC] bg-white p-5 shadow-[0_8px_24px_rgba(32,36,51,0.05)] xsmall:p-6 small:rounded-[28px] small:p-8">
      <Heading
        level="h2"
        className="font-display text-[26px] font-bold text-ink xsmall:text-[30px]"
      >
        Store credit
      </Heading>
      <Text className="mt-1 text-sm text-muted">
        Available:{" "}
        {convertToLocale({
          amount: Number(account.balance),
          currency_code: account.currency_code,
        })}
      </Text>
      {currentCredit > 0 && (
        <Text className="mt-1 text-sm font-bold text-brand">
          Applied:{" "}
          {convertToLocale({
            amount: currentCredit,
            currency_code: account.currency_code,
          })}
        </Text>
      )}
      <div className="mt-5 grid max-w-md gap-3 xsmall:grid-cols-[minmax(0,1fr)_auto] xsmall:items-end">
        <label className="flex flex-1 flex-col gap-y-2 text-sm font-bold text-ink">
          Amount
          <Input
            type="number"
            min="0"
            max={maximum}
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="min-h-12 rounded-[14px] border-[#E6E8EC] bg-white text-base focus:ring-brand"
          />
        </label>
        <Button
          type="button"
          variant="secondary"
          onClick={apply}
          isLoading={isApplying}
          className="min-h-12 rounded-[14px] border-[#E6E8EC] px-5 font-bold hover:border-brand hover:bg-cream hover:text-brand"
        >
          Apply
        </Button>
      </div>
      {error && <Text className="mt-2 text-sm text-rose-600">{error}</Text>}
    </section>
  )
}
