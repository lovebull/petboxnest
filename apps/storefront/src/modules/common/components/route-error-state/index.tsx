"use client"

import {
  ArrowPath,
  ChatBubbleLeftRight,
  ExclamationCircle,
} from "@medusajs/icons"
import {
  createStorefrontErrorId,
  reportStorefrontRouteError,
  type StorefrontErrorScope,
} from "@lib/util/storefront-error"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useEffect, useRef } from "react"

type RouteErrorStateProps = {
  error: Error & { digest?: string }
  reset: () => void
  scope: StorefrontErrorScope
  eyebrow?: string
  title?: string
  description?: string
  backHref?: string
  backLabel?: string
  showContact?: boolean
}

export default function RouteErrorState({
  error,
  reset,
  scope,
  eyebrow = "A small snag in the nest",
  title = "That page didn’t load.",
  description = "Your shopping session is still safe. Try again, or head back to the shop while we straighten things out.",
  backHref = "/store",
  backLabel = "Back to shop",
  showContact = true,
}: RouteErrorStateProps) {
  const errorId = useRef(createStorefrontErrorId(error, scope))

  useEffect(() => {
    void reportStorefrontRouteError({
      error,
      errorId: errorId.current,
      scope,
    })
  }, [error, scope])

  return (
    <section
      className="bg-cream px-4 py-14 text-ink xsmall:px-6 small:py-24"
      role="alert"
      aria-labelledby={`${scope}-error-heading`}
      data-testid={`${scope}-route-error`}
    >
      <div className="mx-auto max-w-[760px] rounded-[24px] border border-grey-20 bg-white p-6 shadow-[0_8px_24px_rgba(32,36,51,0.06)] xsmall:p-8 small:rounded-[32px] small:p-12">
        <span
          className="grid h-12 w-12 place-items-center rounded-[14px] bg-mint text-brand"
          aria-hidden="true"
        >
          <ExclamationCircle className="h-6 w-6" />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-brand">
          {eyebrow}
        </p>
        <h1
          id={`${scope}-error-heading`}
          className="mt-2 text-balance font-display text-[34px] font-bold leading-tight tracking-[-0.035em] small:text-[46px]"
        >
          {title}
        </h1>
        <p className="mt-4 max-w-[600px] text-base leading-7 text-muted">
          {description}
        </p>
        <p className="mt-3 text-xs font-medium uppercase tracking-[0.08em] text-muted">
          Support reference: {errorId.current}
          {error.digest ? ` · ${error.digest}` : ""}
        </p>
        <div className="mt-7 flex flex-col gap-3 xsmall:flex-row xsmall:flex-wrap">
          <button
            type="button"
            onClick={reset}
            className="pbn-primary-button w-full gap-2 xsmall:w-auto"
          >
            <ArrowPath className="h-4 w-4" aria-hidden="true" />
            Try again
          </button>
          <LocalizedClientLink
            href={backHref}
            className="pbn-secondary-button w-full xsmall:w-auto"
          >
            {backLabel}
          </LocalizedClientLink>
          {showContact && (
            <LocalizedClientLink
              href={`/contact?topic=technical_support&reference=${encodeURIComponent(
                errorId.current,
              )}`}
              className="pbn-focus inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] px-4 text-sm font-bold text-brand underline decoration-2 underline-offset-4 hover:text-brand-dark xsmall:w-auto"
            >
              <ChatBubbleLeftRight className="h-4 w-4" aria-hidden="true" />
              Contact support
            </LocalizedClientLink>
          )}
        </div>
      </div>
    </section>
  )
}
