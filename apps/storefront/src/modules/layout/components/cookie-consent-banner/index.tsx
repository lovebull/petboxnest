"use client"

import { XMark } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useCallback, useEffect, useRef, useState } from "react"

import { COOKIE_SETTINGS_EVENT } from "../cookie-settings-button"

type ConsentPreferences = {
  necessary: true
  analytics: boolean
  marketing: boolean
}

type StoredConsent = {
  version: number
  preferences: ConsentPreferences
  saved_at: string
}

const CONSENT_STORAGE_KEY = "petboxnest_cookie_consent_v1"
const CONSENT_COOKIE_NAME = "petboxnest_cookie_consent"
const CONSENT_SESSION_DISMISS_KEY = "petboxnest_cookie_consent_dismissed"
const CONSENT_MAX_AGE = 60 * 60 * 24 * 180

const defaultPreferences: ConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
}

const allPreferences: ConsentPreferences = {
  necessary: true,
  analytics: true,
  marketing: true,
}

const readConsent = (): ConsentPreferences | null => {
  try {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY)

    if (!stored) {
      return null
    }

    const parsed = JSON.parse(stored) as StoredConsent
    const preferences = parsed.preferences

    if (
      parsed.version !== 1 ||
      preferences?.necessary !== true ||
      typeof preferences.analytics !== "boolean" ||
      typeof preferences.marketing !== "boolean"
    ) {
      return null
    }

    return preferences
  } catch {
    return null
  }
}

const saveConsent = (preferences: ConsentPreferences) => {
  const payload: StoredConsent = {
    version: 1,
    preferences,
    saved_at: new Date().toISOString(),
  }

  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload))
  window.sessionStorage.removeItem(CONSENT_SESSION_DISMISS_KEY)
  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(
    JSON.stringify(payload)
  )}; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax`
}

const CookieConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isManaging, setIsManaging] = useState(false)
  const [preferences, setPreferences] =
    useState<ConsentPreferences>(defaultPreferences)
  const panelRef = useRef<HTMLDivElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  const openSettings = useCallback(() => {
    returnFocusRef.current = document.activeElement as HTMLElement | null
    setPreferences(readConsent() ?? defaultPreferences)
    setIsManaging(true)
    setIsVisible(true)
  }, [])

  const closePanel = useCallback((rememberForSession = false) => {
    if (rememberForSession) {
      window.sessionStorage.setItem(CONSENT_SESSION_DISMISS_KEY, "true")
    }

    setIsVisible(false)
    setIsManaging(false)
    window.requestAnimationFrame(() => returnFocusRef.current?.focus())
  }, [])

  useEffect(() => {
    const storedPreferences = readConsent()
    const wasDismissed = Boolean(
      window.sessionStorage.getItem(CONSENT_SESSION_DISMISS_KEY)
    )

    if (storedPreferences) {
      setPreferences(storedPreferences)
    } else if (!wasDismissed) {
      setIsVisible(true)
    }

    window.addEventListener(COOKIE_SETTINGS_EVENT, openSettings)
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, openSettings)
  }, [openSettings])

  useEffect(() => {
    if (!isVisible) {
      return
    }

    const focusTimer = window.requestAnimationFrame(() => panelRef.current?.focus())
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        closePanel(!readConsent())
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.cancelAnimationFrame(focusTimer)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [closePanel, isVisible])

  const handleSave = (nextPreferences: ConsentPreferences) => {
    saveConsent(nextPreferences)
    setPreferences(nextPreferences)
    closePanel()
  }

  const togglePreference = (key: "analytics" | "marketing") => {
    setPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }))
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] xsmall:p-4 xsmall:pb-[calc(1rem+env(safe-area-inset-bottom))] small:left-auto small:w-full small:max-w-[460px] small:p-6">
      <div
        ref={panelRef}
        role="dialog"
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-description"
        tabIndex={-1}
        className="pointer-events-auto max-h-[min(70vh,560px)] overflow-y-auto rounded-[20px] border border-ui-border-base bg-white p-4 text-ink shadow-elevation-modal outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 xsmall:p-5"
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p
              id="cookie-consent-title"
              className="font-display text-lg font-extrabold tracking-[-0.02em]"
            >
              Your cookie choices
            </p>
            <p
              id="cookie-consent-description"
              className="mt-1 text-sm leading-5 text-muted"
            >
              Necessary cookies keep your cart and checkout working. You choose
              whether analytics and marketing cookies are used.
            </p>
          </div>
          <button
            type="button"
            className="pbn-focus -mr-2 -mt-2 flex size-11 shrink-0 items-center justify-center rounded-[12px] text-muted transition-colors hover:bg-mist hover:text-ink"
            onClick={() => closePanel(!readConsent())}
            aria-label="Decide later and close cookie preferences"
          >
            <XMark aria-hidden="true" />
          </button>
        </div>

        {isManaging && (
          <div className="mt-4 space-y-2 border-t border-ui-border-base pt-4">
            <div className="rounded-[14px] bg-cream p-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-bold">Necessary</span>
                <span className="text-xs font-bold text-muted">Always on</span>
              </div>
              <p className="mt-1 text-xs leading-5 text-muted">
                Required for security, account sessions, cart, and checkout.
              </p>
            </div>

            <PreferenceToggle
              label="Analytics"
              description="Helps us understand site performance and shopping flows."
              checked={preferences.analytics}
              onChange={() => togglePreference("analytics")}
            />
            <PreferenceToggle
              label="Marketing"
              description="Allows relevant offers and campaign measurement."
              checked={preferences.marketing}
              onChange={() => togglePreference("marketing")}
            />
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="pbn-focus min-h-11 rounded-[14px] border border-ui-border-base bg-white px-3 text-sm font-bold transition-colors hover:border-brand hover:text-brand"
            onClick={() => handleSave(defaultPreferences)}
          >
            Essential only
          </button>
          <button
            type="button"
            className="pbn-focus min-h-11 rounded-[14px] bg-brand px-3 text-sm font-bold text-white transition-colors hover:bg-brand-dark"
            onClick={() => handleSave(allPreferences)}
          >
            Accept all
          </button>
        </div>

        <div className="mt-2 flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs font-bold">
          <button
            type="button"
            className="pbn-focus min-h-11 rounded-lg text-brand underline decoration-2 underline-offset-4 hover:text-brand-dark"
            onClick={() =>
              isManaging ? handleSave(preferences) : setIsManaging(true)
            }
            aria-expanded={isManaging}
          >
            {isManaging ? "Save custom choices" : "Customize"}
          </button>
          <button
            type="button"
            className="pbn-focus min-h-11 rounded-lg text-muted underline underline-offset-4 hover:text-ink"
            onClick={() => closePanel(true)}
          >
            Decide later
          </button>
          <LocalizedClientLink
            href="/privacy-policy"
            className="pbn-focus flex min-h-11 items-center rounded-lg text-muted underline underline-offset-4 hover:text-ink"
          >
            Privacy Policy
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

type PreferenceToggleProps = {
  label: string
  description: string
  checked: boolean
  onChange: () => void
}

const PreferenceToggle = ({
  label,
  description,
  checked,
  onChange,
}: PreferenceToggleProps) => (
  <label className="flex min-h-11 cursor-pointer items-start justify-between gap-4 rounded-[14px] border border-ui-border-base p-3 transition-colors hover:border-brand/50">
    <span>
      <span className="block text-sm font-bold">{label}</span>
      <span className="mt-1 block text-xs leading-5 text-muted">
        {description}
      </span>
    </span>
    <input
      type="checkbox"
      className="mt-1 size-5 shrink-0 accent-brand"
      checked={checked}
      onChange={onChange}
    />
  </label>
)

export default CookieConsentBanner
