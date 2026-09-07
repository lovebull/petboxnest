"use client"

export const COOKIE_SETTINGS_EVENT = "petboxnest:open-cookie-settings"

const CookieSettingsButton = () => {
  return (
    <button
      type="button"
      className="pbn-focus flex min-h-11 items-center rounded-lg text-left hover:text-brand"
      onClick={() => window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))}
    >
      Cookie settings
    </button>
  )
}

export default CookieSettingsButton
