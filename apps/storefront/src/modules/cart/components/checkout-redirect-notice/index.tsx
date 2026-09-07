"use client"

import { InformationCircleSolid, XMark } from "@medusajs/icons"
import { useEffect, useState } from "react"

const CheckoutRedirectNotice = () => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.delete("checkout_notice")
    window.history.replaceState(window.history.state, "", url)
  }, [])

  if (!isVisible) {
    return null
  }

  return (
    <div
      role="alert"
      className="mb-5 flex items-start gap-3 rounded-[16px] border border-brand/25 bg-white px-4 py-3 text-ink xsmall:items-center"
      data-testid="empty-checkout-notice"
    >
      <InformationCircleSolid
        className="mt-0.5 shrink-0 text-brand xsmall:mt-0"
        aria-hidden="true"
      />
      <p className="min-w-0 flex-1 text-sm font-bold leading-6">
        Your cart is empty. Add a product before checking out.
      </p>
      <button
        type="button"
        onClick={() => setIsVisible(false)}
        className="pbn-focus -my-2 -mr-2 flex size-11 shrink-0 items-center justify-center rounded-[12px] text-muted transition-colors hover:bg-mist hover:text-ink"
        aria-label="Dismiss empty cart message"
      >
        <XMark aria-hidden="true" />
      </button>
    </div>
  )
}

export default CheckoutRedirectNotice
