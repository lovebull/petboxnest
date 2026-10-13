"use client"

import {
  ANALYTICS_CONSENT_CHANGED_EVENT,
  canCollectStorefrontAnalytics,
  clearAnalyticsIdentity,
  flushPendingStorefrontAnalytics,
  trackStorefrontEvent,
} from "@lib/analytics/client"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

const countryCodeFromPath = (pathname: string) => {
  const segment = pathname.split("/").filter(Boolean)[0]
  return segment?.length === 2 ? segment.toLowerCase() : undefined
}

const StorefrontAnalytics = () => {
  const pathname = usePathname()
  const recordedPathRef = useRef<string | null>(null)

  useEffect(() => {
    const recordPage = async () => {
      if (!(await canCollectStorefrontAnalytics())) return
      if (recordedPathRef.current === pathname) return
      recordedPathRef.current = pathname
      const details = {
        path: pathname,
        country_code: countryCodeFromPath(pathname),
      }
      await trackStorefrontEvent("page_view", details).catch(() => undefined)
      if (/\/[a-z]{2}\/checkout(?:\/|$|\?)/.test(pathname)) {
        await trackStorefrontEvent("checkout_started", details).catch(
          () => undefined,
        )
      }
    }

    void recordPage()
    void flushPendingStorefrontAnalytics()
    const handleOnline = () => void flushPendingStorefrontAnalytics()
    const handleConsent = (event: Event) => {
      const allowed = (event as CustomEvent<{ analytics: boolean }>).detail
        ?.analytics
      if (allowed) void recordPage()
      else clearAnalyticsIdentity()
    }
    window.addEventListener(ANALYTICS_CONSENT_CHANGED_EVENT, handleConsent)
    window.addEventListener("online", handleOnline)
    return () => {
      window.removeEventListener(ANALYTICS_CONSENT_CHANGED_EVENT, handleConsent)
      window.removeEventListener("online", handleOnline)
    }
  }, [pathname])

  return null
}

export default StorefrontAnalytics
