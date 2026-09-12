"use client"

import {
  ArrowPath,
  ChatBubbleLeftRight,
  ExclamationCircle,
} from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useEffect } from "react"

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[checkout-route-error]", {
      event: "checkout_render_failed",
      digest: error.digest,
      name: error.name,
    })
  }, [error])

  return (
    <main className="bg-cream px-4 py-14 text-ink xsmall:px-6 small:py-24">
      <section
        className="mx-auto max-w-[760px] rounded-[24px] border border-[#E6E8EC] bg-white p-6 shadow-[0_8px_24px_rgba(32,36,51,0.06)] xsmall:p-8 small:rounded-[32px] small:p-12"
        role="alert"
        aria-labelledby="checkout-error-heading"
        data-testid="checkout-route-error"
      >
        <span
          className="grid h-12 w-12 place-items-center rounded-[14px] bg-[#FFF0EE] text-danger"
          aria-hidden="true"
        >
          <ExclamationCircle className="h-6 w-6" />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-brand">
          Checkout paused
        </p>
        <h1
          id="checkout-error-heading"
          className="mt-2 text-balance font-display text-[34px] font-bold leading-tight tracking-[-0.035em] small:text-[46px]"
        >
          Your nest is still saved.
        </h1>
        <p className="mt-4 max-w-[600px] text-base leading-7 text-muted">
          Something unexpected interrupted checkout. Try loading it again, or
          contact our team if the problem continues.
        </p>
        {error.digest && (
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.08em] text-muted">
            Support reference: {error.digest}
          </p>
        )}
        <div className="mt-7 flex flex-col gap-3 xsmall:flex-row xsmall:flex-wrap">
          <button
            type="button"
            onClick={reset}
            className="pbn-primary-button w-full gap-2 xsmall:w-auto"
          >
            <ArrowPath className="h-4 w-4" aria-hidden="true" />
            Reload checkout
          </button>
          <LocalizedClientLink
            href="/cart"
            className="pbn-secondary-button w-full xsmall:w-auto"
          >
            Return to cart
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/contact?topic=order_support&source=checkout"
            className="pbn-focus inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] px-4 text-sm font-bold text-brand underline decoration-2 underline-offset-4 hover:text-brand-dark xsmall:w-auto"
          >
            <ChatBubbleLeftRight className="h-4 w-4" aria-hidden="true" />
            Contact support
          </LocalizedClientLink>
        </div>
      </section>
    </main>
  )
}
