"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useEffect, useState } from "react"

type ConsentPreferences = {
  necessary: true
  analytics: boolean
  marketing: boolean
}

const CONSENT_STORAGE_KEY = "petboxnest_cookie_consent_v1"
const CONSENT_COOKIE_NAME = "petboxnest_cookie_consent"
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

const saveConsent = (preferences: ConsentPreferences) => {
  const payload = {
    version: 1,
    preferences,
    saved_at: new Date().toISOString(),
  }

  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload))
  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(
    JSON.stringify(payload)
  )}; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax`
}

const hasSavedConsent = () => {
  return Boolean(window.localStorage.getItem(CONSENT_STORAGE_KEY))
}

const CookieConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isManaging, setIsManaging] = useState(false)
  const [preferences, setPreferences] =
    useState<ConsentPreferences>(defaultPreferences)

  useEffect(() => {
    setIsVisible(!hasSavedConsent())
  }, [])

  const handleSave = (nextPreferences: ConsentPreferences) => {
    saveConsent(nextPreferences)
    setPreferences(nextPreferences)
    setIsVisible(false)
    setIsManaging(false)
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
    <div
      className="fixed inset-x-0 bottom-0 z-[100] px-4 pb-4 small:px-6 small:pb-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
    >
      <div className="mx-auto max-w-5xl border border-ui-border-base bg-ui-bg-base p-5 shadow-elevation-modal small:p-6">
        <div className="grid gap-5 medium:grid-cols-[minmax(0,1fr)_auto] medium:items-end">
          <div>
            <p
              id="cookie-consent-title"
              className="text-base-semi text-ui-fg-base"
            >
              Cookie preferences
            </p>
            <p className="mt-2 max-w-3xl text-small-regular text-ui-fg-subtle">
              We use necessary cookies to keep the storefront working. With your
              consent, we also use analytics and marketing cookies to improve
              the shopping experience. You can change your choice at any time.
            </p>
            <LocalizedClientLink
              href="/privacy-policy"
              className="mt-3 inline-flex text-small-semi text-ui-fg-base underline underline-offset-4"
            >
              Privacy Policy
            </LocalizedClientLink>
          </div>

          <div className="flex flex-col gap-2 small:flex-row medium:justify-end">
            <button
              type="button"
              className="min-h-11 border border-ui-border-base bg-ui-bg-base px-5 text-small-semi text-ui-fg-base transition-colors hover:bg-ui-bg-subtle"
              onClick={() => setIsManaging(true)}
            >
              Manage choices
            </button>
            <button
              type="button"
              className="min-h-11 border border-ui-border-base bg-ui-bg-base px-5 text-small-semi text-ui-fg-base transition-colors hover:bg-ui-bg-subtle"
              onClick={() => handleSave(defaultPreferences)}
            >
              Reject non-essential
            </button>
            <button
              type="button"
              className="min-h-11 bg-ui-fg-base px-5 text-small-semi text-ui-bg-base transition-colors hover:bg-ui-fg-subtle"
              onClick={() => handleSave(allPreferences)}
            >
              Accept all
            </button>
          </div>
        </div>

        {isManaging && (
          <div className="mt-5 border-t border-ui-border-base pt-5">
            <div className="grid gap-3 medium:grid-cols-3">
              <div className="border border-ui-border-base p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-small-semi text-ui-fg-base">
                      Necessary
                    </p>
                    <p className="mt-1 text-small-regular text-ui-fg-subtle">
                      Required for cart, checkout, security, and account
                      sessions.
                    </p>
                  </div>
                  <span className="text-small-semi text-ui-fg-subtle">
                    Always on
                  </span>
                </div>
              </div>

              <label className="border border-ui-border-base p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-small-semi text-ui-fg-base">
                      Analytics
                    </span>
                    <p className="mt-1 text-small-regular text-ui-fg-subtle">
                      Helps us understand page performance and shopping flows.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-ui-fg-base"
                    checked={preferences.analytics}
                    onChange={() => togglePreference("analytics")}
                  />
                </div>
              </label>

              <label className="border border-ui-border-base p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-small-semi text-ui-fg-base">
                      Marketing
                    </span>
                    <p className="mt-1 text-small-regular text-ui-fg-subtle">
                      Allows personalized offers and campaign measurement.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-ui-fg-base"
                    checked={preferences.marketing}
                    onChange={() => togglePreference("marketing")}
                  />
                </div>
              </label>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="min-h-11 bg-ui-fg-base px-5 text-small-semi text-ui-bg-base transition-colors hover:bg-ui-fg-subtle"
                onClick={() => handleSave(preferences)}
              >
                Save choices
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CookieConsentBanner
