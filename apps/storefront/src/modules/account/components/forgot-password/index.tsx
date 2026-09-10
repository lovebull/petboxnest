"use client"

import { requestPasswordReset, type PasswordResetState } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState, useEffect, useState } from "react"

const initialState: PasswordResetState = { state: "idle", message: "" }

type Props = { setCurrentView: (view: LOGIN_VIEW) => void }

const ForgotPassword = ({ setCurrentView }: Props) => {
  const [state, action] = useActionState(requestPasswordReset, initialState)
  const [fingerprint, setFingerprint] = useState("unavailable")
  const [countryCode, setCountryCode] = useState("us")

  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number }
    setFingerprint(JSON.stringify({
      userAgent: nav.userAgent,
      language: nav.language,
      languages: nav.languages,
      platform: nav.platform,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: `${window.screen.width}x${window.screen.height}`,
      colorDepth: window.screen.colorDepth,
      hardwareConcurrency: nav.hardwareConcurrency,
      deviceMemory: nav.deviceMemory,
      touchPoints: nav.maxTouchPoints,
    }))
    setCountryCode(window.location.pathname.split("/")[1] || "us")
  }, [])

  return (
    <div className="flex w-full max-w-sm flex-col items-center">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Account recovery</p>
      <h1 className="mt-3 text-center font-display text-3xl font-bold text-ink">Reset your password</h1>
      <p className="mb-7 mt-3 text-center text-base leading-7 text-muted">Enter your account email and we&apos;ll send a secure, one-time reset link.</p>
      {state.state === "success" ? (
        <div className="w-full rounded-[18px] border border-mint bg-cream p-5 text-center text-sm font-semibold leading-6 text-ink" role="status">{state.message}</div>
      ) : (
        <form className="w-full" action={action}>
          <Input label="Email" name="email" type="email" autoComplete="email" inputMode="email" required />
          <input type="hidden" name="browser_fingerprint" value={fingerprint} />
          <input type="hidden" name="country_code" value={countryCode} />
          <ErrorMessage error={state.state === "error" ? state.message : null} />
          <SubmitButton className="pbn-primary-button mt-6 min-h-12 w-full">Send reset link</SubmitButton>
        </form>
      )}
      <button type="button" onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)} className="pbn-focus mt-6 min-h-11 rounded-sm font-bold text-brand underline decoration-2 underline-offset-4">Back to sign in</button>
    </div>
  )
}

export default ForgotPassword
