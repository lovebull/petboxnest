"use client"

import {
  ANALYTICS_CONSENT_CHANGED_EVENT,
  clearAnalyticsIdentity,
  hasAnalyticsConsent,
  trackStorefrontEvent,
} from "@lib/analytics/client"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

const countryCodeFromPath = (pathname: string) => {
  const segment = pathname.split("/").filter(Boolean)[0]
  return segment?.length === 2 ? segment.toLowerCase() : undefined
}

const StorefrontAnalytics = () => {
  const pathname = usePathname()

  useEffect(() => {
    const recordPage = () => {
      if (!hasAnalyticsConsent()) return
      const details = {
        path: pathname,
        country_code: countryCodeFromPath(pathname),
      }
      void trackStorefrontEvent("page_view", details).catch(() => undefined)
      if (/\/[a-z]{2}\/products\//.test(pathname)) {
        void trackStorefrontEvent("product_view", details).catch(() => undefined)
      }
      if (/\/[a-z]{2}\/checkout(?:\/|$|\?)/.test(pathname)) {
        void trackStorefrontEvent("checkout_started", details).catch(
          () => undefined
        )
      }
    }

    recordPage()
    const handleConsent = (event: Event) => {
      const allowed = (event as CustomEvent<{ analytics: boolean }>).detail
        ?.analytics
      if (allowed) recordPage()
      else clearAnalyticsIdentity()
    }
    window.addEventListener(ANALYTICS_CONSENT_CHANGED_EVENT, handleConsent)
    return () =>
      window.removeEventListener(
        ANALYTICS_CONSENT_CHANGED_EVENT,
        handleConsent
      )
  }, [pathname])

  return null
}

export default StorefrontAnalytics
