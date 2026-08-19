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
  const maximum = Math.min(Number(account.balance), currentCredit + Number(cart.total || 0))
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
      setError(caught instanceof Error ? caught.message : "Unable to apply store credit.")
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <div className="border-y border-gray-200 py-6">
      <Heading level="h2" className="text-2xl-regular">Store credit</Heading>
      <Text className="mt-1 text-small-regular text-ui-fg-subtle">
        Available: {convertToLocale({ amount: Number(account.balance), currency_code: account.currency_code })}
      </Text>
      {currentCredit > 0 && (
        <Text className="mt-1 text-small-regular text-ui-fg-interactive">
          Applied: {convertToLocale({ amount: currentCredit, currency_code: account.currency_code })}
        </Text>
      )}
      <div className="mt-4 flex max-w-md items-end gap-3">
        <label className="flex flex-1 flex-col gap-y-2 text-small-semi">
          Amount
          <Input
            type="number"
            min="0"
            max={maximum}
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </label>
        <Button type="button" variant="secondary" onClick={apply} isLoading={isApplying}>
          Apply
        </Button>
      </div>
      {error && <Text className="mt-2 text-small-regular text-rose-600">{error}</Text>}
    </div>
  )
}
