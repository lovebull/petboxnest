"use client"

import { sdk } from "@lib/config"

export const ANALYTICS_CONSENT_CHANGED_EVENT =
  "petboxnest:analytics-consent-changed"

const CONSENT_STORAGE_KEY = "petboxnest_cookie_consent_v1"
const VISITOR_STORAGE_KEY = "petboxnest_analytics_visitor_v1"
const SESSION_STORAGE_KEY = "petboxnest_analytics_session_v1"
const LAST_EVENT_STORAGE_KEY = "petboxnest_analytics_last_event_v1"
const SESSION_TIMEOUT_MS = 30 * 60 * 1000

type AnalyticsEventType =
  | "page_view"
  | "product_view"
  | "add_to_cart"
  | "checkout_started"
  | "order_completed"

type AnalyticsEventDetails = {
  path?: string
  country_code?: string
  product_id?: string
  variant_id?: string
  cart_id?: string
  order_id?: string
}

type StoredSession = {
  id: string
  last_seen_at: number
}

export const hasAnalyticsConsent = () => {
  try {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!stored) return false
    const parsed = JSON.parse(stored) as {
      version?: number
      preferences?: { analytics?: boolean }
    }
    return parsed.version === 1 && parsed.preferences?.analytics === true
  } catch {
    return false
  }
}

const getIdentity = () => {
  const now = Date.now()
  let visitorId = window.localStorage.getItem(VISITOR_STORAGE_KEY)
  if (!visitorId) {
    visitorId = crypto.randomUUID()
    window.localStorage.setItem(VISITOR_STORAGE_KEY, visitorId)
  }

  let session: StoredSession | null = null
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)
    session = raw ? (JSON.parse(raw) as StoredSession) : null
  } catch {
    session = null
  }
  if (!session || now - session.last_seen_at > SESSION_TIMEOUT_MS) {
    session = { id: crypto.randomUUID(), last_seen_at: now }
  } else {
    session.last_seen_at = now
  }
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  return { visitorId, sessionId: session.id }
}

const isImmediateDuplicate = (eventType: AnalyticsEventType, path?: string) => {
  const key = `${eventType}:${path || ""}`
  const now = Date.now()
  try {
    const raw = window.sessionStorage.getItem(LAST_EVENT_STORAGE_KEY)
    const previous = raw
      ? (JSON.parse(raw) as { key: string; recorded_at: number })
      : null
    window.sessionStorage.setItem(
      LAST_EVENT_STORAGE_KEY,
      JSON.stringify({ key, recorded_at: now })
    )
    return previous?.key === key && now - previous.recorded_at < 1_500
  } catch {
    return false
  }
}

export const clearAnalyticsIdentity = () => {
  window.localStorage.removeItem(VISITOR_STORAGE_KEY)
  window.localStorage.removeItem(SESSION_STORAGE_KEY)
  window.sessionStorage.removeItem(LAST_EVENT_STORAGE_KEY)
}

let analyticsQueue: Promise<void> = Promise.resolve()

const sendStorefrontEvent = async (
  eventType: AnalyticsEventType,
  details: AnalyticsEventDetails = {}
) => {
  if (!hasAnalyticsConsent() || isImmediateDuplicate(eventType, details.path)) {
    return
  }
  const { visitorId, sessionId } = getIdentity()
  await sdk.client.fetch("/store/analytics/events", {
    method: "POST",
    body: {
      event_id: crypto.randomUUID(),
      event_type: eventType,
      visitor_id: visitorId,
      session_id: sessionId,
      ...details,
    },
    cache: "no-store",
  })
}

export const trackStorefrontEvent = (
  eventType: AnalyticsEventType,
  details: AnalyticsEventDetails = {}
) => {
  const task = analyticsQueue.then(() => sendStorefrontEvent(eventType, details))
  analyticsQueue = task.catch(() => undefined)
  return task
}
