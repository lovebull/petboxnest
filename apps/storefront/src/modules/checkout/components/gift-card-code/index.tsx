"use client"

import { applyGiftCard, removeGiftCard } from "@lib/data/cart"
import {
  getGiftCardAppliedAmount,
  getGiftCards,
  maskGiftCardCode,
} from "@lib/types/loyalty"
import { convertToLocale } from "@lib/util/money"
import { Gift } from "@medusajs/icons"
import type { HttpTypes } from "@medusajs/types"
import {
  Button,
  Heading,
  Input,
  Label,
  Text,
} from "@modules/common/components/ui"
import Trash from "@modules/common/icons/trash"
import { useRouter } from "next/navigation"
import { FormEvent, useId, useState } from "react"

const getFriendlyError = (error: unknown) => {
  const message = error instanceof Error ? error.message.toLowerCase() : ""

  if (message.includes("already applied")) {
    return "That gift card is already applied to this cart."
  }
  if (message.includes("currency")) {
    return "This gift card uses a different currency from your cart."
  }
  if (message.includes("balance")) {
    return "This gift card has no available value."
  }
  if (message.includes("expired")) {
    return "This gift card has expired."
  }
  if (message.includes("not found")) {
    return "We couldn't find that gift card. Check the code and try again."
  }

  return "We couldn't apply that gift card. Check the code or try again."
}

const GiftCardCode = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const router = useRouter()
  const inputId = useId()
  const giftCards = getGiftCards(cart)
  const [code, setCode] = useState("")
  const [isOpen, setIsOpen] = useState(giftCards.length > 0)
  const [isApplying, setIsApplying] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const apply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!code.trim()) {
      setError("Enter a gift card code.")
      return
    }

    setIsApplying(true)
    setError(null)
    setSuccess(null)
    try {
      await applyGiftCard(code)
      setCode("")
      setSuccess("Gift card applied. Your order total has been updated.")
      router.refresh()
    } catch (caught) {
      setError(getFriendlyError(caught))
    } finally {
      setIsApplying(false)
    }
  }

  const remove = async (giftCardId: string, giftCardCode: string) => {
    setRemovingId(giftCardId)
    setError(null)
    setSuccess(null)
    try {
      await removeGiftCard(giftCardCode)
      setSuccess("Gift card removed from this order.")
      router.refresh()
    } catch {
      setError("We couldn't remove that gift card. Please try again.")
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <section className="rounded-[20px] border border-[#E6E8EC] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-mint/60 text-brand">
            <Gift aria-hidden="true" />
          </span>
          <div>
            <Heading className="text-sm font-bold text-ink">Gift card</Heading>
            <Text className="text-xs text-muted">
              Add a little joy to this order.
            </Text>
          </div>
        </div>
        <button
          type="button"
          className="pbn-focus min-h-11 rounded-[14px] bg-cream px-4 text-sm font-bold text-brand transition hover:bg-mist"
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
          aria-controls={`${inputId}-panel`}
        >
          {isOpen ? "Hide" : "Add card"}
        </button>
      </div>

      {isOpen && (
        <form
          id={`${inputId}-panel`}
          onSubmit={apply}
          className="mt-4 border-t border-[#E6E8EC] pt-4"
        >
          <Label htmlFor={inputId} className="text-sm font-bold text-ink">
            Gift card code
          </Label>
          <div className="mt-2 grid gap-2 xsmall:grid-cols-[minmax(0,1fr)_auto]">
            <Input
              id={inputId}
              name="gift-card-code"
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              aria-invalid={Boolean(error)}
              aria-describedby={`${inputId}-message`}
              className="min-h-12 rounded-[14px] border-[#E6E8EC] text-base"
            />
            <Button
              type="submit"
              variant="secondary"
              isLoading={isApplying}
              disabled={isApplying || !code.trim()}
              className="min-h-12 rounded-[14px] border-[#E6E8EC] px-5 font-bold hover:border-brand hover:bg-cream hover:text-brand"
            >
              Apply
            </Button>
          </div>
        </form>
      )}

      <div id={`${inputId}-message`} aria-live="polite">
        {error && <Text className="mt-3 text-sm text-rose-700">{error}</Text>}
        {success && (
          <Text className="mt-3 text-sm font-semibold text-green-700">
            {success}
          </Text>
        )}
      </div>

      {giftCards.length > 0 && (
        <div className="mt-4 flex flex-col gap-2 border-t border-[#E6E8EC] pt-4">
          <Text className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
            Applied gift cards
          </Text>
          {giftCards.map((giftCard) => {
            const appliedAmount = getGiftCardAppliedAmount(cart, giftCard.id)
            return (
              <div
                key={giftCard.id}
                className="flex min-h-14 items-center justify-between gap-3 rounded-[14px] bg-cream px-3 py-2"
              >
                <div className="min-w-0">
                  <Text className="font-mono text-sm font-bold text-ink">
                    {maskGiftCardCode(giftCard.code)}
                  </Text>
                  <Text className="text-xs leading-5 text-muted">
                    Card value{" "}
                    {convertToLocale({
                      amount: giftCard.value,
                      currency_code: giftCard.currency_code,
                    })}
                    {" · "}Applied{" "}
                    {convertToLocale({
                      amount: appliedAmount,
                      currency_code: cart.currency_code,
                    })}
                  </Text>
                  {giftCard.expires_at && (
                    <Text className="text-xs text-muted">
                      Expires{" "}
                      {new Date(giftCard.expires_at).toLocaleDateString(
                        "en-US"
                      )}
                    </Text>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(giftCard.id, giftCard.code)}
                  disabled={removingId === giftCard.id}
                  className="pbn-focus grid min-h-11 min-w-11 shrink-0 place-items-center rounded-xl text-muted transition hover:bg-white hover:text-brand disabled:opacity-50"
                  aria-label={`Remove gift card ending in ${giftCard.code
                    .replace(/[^a-zA-Z0-9]/g, "")
                    .slice(-4)}`}
                >
                  <Trash size={16} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default GiftCardCode
