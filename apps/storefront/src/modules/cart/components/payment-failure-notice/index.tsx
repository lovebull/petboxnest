"use client"

import { ExclamationCircle, XMark } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useEffect, useState } from "react"

export type CartPaymentError = "payment_failed" | "order_failed"

const messages: Record<
  CartPaymentError,
  { title: string; description: string }
> = {
  payment_failed: {
    title: "Payment was not completed",
    description:
      "We couldn't confirm the payment. Review your payment details and try again. If you see a pending charge, contact us before retrying.",
  },
  order_failed: {
    title: "We couldn't finish the order",
    description:
      "Your cart is still saved. Check your email and account for an order confirmation before trying again, so you don't place the same order twice.",
  },
}

export default function PaymentFailureNotice({
  error,
  canRetry,
}: {
  error: CartPaymentError
  canRetry: boolean
}) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.delete("error")
    window.history.replaceState(window.history.state, "", url)
  }, [])

  if (!isVisible) {
    return null
  }

  const message = messages[error]

  return (
    <section
      role="alert"
      aria-live="assertive"
      className="mb-5 rounded-[18px] border border-danger/25 bg-[#FFF0EE] p-4 text-ink xsmall:p-5"
      data-testid="cart-payment-error"
    >
      <div className="flex items-start gap-3">
        <ExclamationCircle
          className="mt-0.5 shrink-0 text-danger"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-bold leading-6">
            {message.title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            {message.description}
          </p>
          <div className="mt-4 flex flex-col gap-2 xsmall:flex-row xsmall:flex-wrap">
            {canRetry && (
              <LocalizedClientLink
                href="/checkout?step=payment"
                className="pbn-primary-button min-h-11 w-full px-5 text-sm xsmall:w-auto"
              >
                Review payment
              </LocalizedClientLink>
            )}
            <LocalizedClientLink
              href="/contact?topic=order_support&source=payment_failure"
              className="pbn-secondary-button min-h-11 w-full px-5 text-sm xsmall:w-auto"
            >
              Contact support
            </LocalizedClientLink>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="pbn-focus -mr-2 -mt-2 flex size-11 shrink-0 items-center justify-center rounded-[12px] text-muted transition-colors hover:bg-white hover:text-ink"
          aria-label="Dismiss payment error"
        >
          <XMark aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}
