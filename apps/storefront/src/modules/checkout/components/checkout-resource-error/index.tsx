"use client"

import { retryCheckoutResource } from "@lib/data/checkout"
import type {
  CheckoutResource,
  CheckoutResourceError,
} from "@lib/types/checkout-resource"
import {
  ArrowPath,
  ChatBubbleLeftRight,
  ExclamationCircle,
} from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

type CheckoutResourceErrorProps = {
  resource: CheckoutResource
  title: string
  message: string
  error?: CheckoutResourceError
  compact?: boolean
  showEditAddress?: boolean
}

export default function CheckoutResourceErrorState({
  resource,
  title,
  message,
  error,
  compact = false,
  showEditAddress = false,
}: CheckoutResourceErrorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [retryError, setRetryError] = useState<string | null>(null)

  const retry = () => {
    setRetryError(null)
    startTransition(async () => {
      try {
        await retryCheckoutResource(resource)
        router.refresh()
      } catch {
        setRetryError(
          "The retry didn't complete. Please try once more or contact us."
        )
      }
    })
  }

  return (
    <section
      className={
        compact
          ? "rounded-[18px] border border-[#E6E8EC] bg-cream p-4 xsmall:p-5"
          : "rounded-[24px] border border-[#E6E8EC] bg-white p-5 shadow-[0_8px_24px_rgba(32,36,51,0.05)] xsmall:p-6 small:rounded-[28px] small:p-8"
      }
      role="alert"
      aria-live="polite"
      data-testid={`checkout-${resource}-error`}
    >
      <div className="flex items-start gap-4">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[#FFF0EE] text-danger"
          aria-hidden="true"
        >
          <ExclamationCircle className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2
            className={
              compact
                ? "font-display text-xl font-bold leading-tight text-ink"
                : "font-display text-[26px] font-bold leading-tight text-ink xsmall:text-[30px]"
            }
          >
            {title}
          </h2>
          <p className="mt-2 max-w-[620px] text-base leading-6 text-muted">
            {message}
          </p>

          {retryError && (
            <p className="mt-3 text-sm font-medium text-danger">{retryError}</p>
          )}

          {error?.errorId && (
            <p className="mt-3 text-xs font-medium uppercase tracking-[0.08em] text-muted">
              Support reference: {error.errorId}
            </p>
          )}

          <div className="mt-5 flex flex-col gap-3 xsmall:flex-row xsmall:flex-wrap">
            <button
              type="button"
              onClick={retry}
              disabled={isPending}
              className="pbn-primary-button w-full gap-2 disabled:cursor-wait disabled:opacity-65 xsmall:w-auto"
              data-testid={`retry-${resource}`}
            >
              <ArrowPath
                className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              {isPending ? "Trying again..." : "Try again"}
            </button>

            {showEditAddress && (
              <LocalizedClientLink
                href="/checkout?step=address"
                className="pbn-secondary-button w-full xsmall:w-auto"
              >
                Edit delivery address
              </LocalizedClientLink>
            )}

            <LocalizedClientLink
              href="/contact?topic=order_support&source=checkout"
              className="pbn-focus inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] px-4 text-sm font-bold text-brand underline decoration-2 underline-offset-4 transition-colors hover:text-brand-dark xsmall:w-auto"
            >
              <ChatBubbleLeftRight className="h-4 w-4" aria-hidden="true" />
              Contact support
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </section>
  )
}
