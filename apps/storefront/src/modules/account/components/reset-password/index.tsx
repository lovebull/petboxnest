"use client"

import { completePasswordReset, type PasswordResetState } from "@lib/data/customer"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"

const initialState: PasswordResetState = { state: "idle", message: "" }

const ResetPassword = ({ email, token }: { email: string; token: string }) => {
  const [state, action] = useActionState(completePasswordReset, initialState)

  if (state.state === "success") {
    return (
      <div className="text-center" role="status">
        <h1 className="font-display text-3xl font-bold text-ink">Password updated</h1>
        <p className="mt-4 text-base leading-7 text-muted">{state.message}</p>
        <LocalizedClientLink href="/account" className="pbn-primary-button mt-7 inline-flex min-h-12 items-center justify-center px-7">Sign in</LocalizedClientLink>
      </div>
    )
  }

  return (
    <form action={action} className="w-full">
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="token" value={token} />
      <div className="grid gap-3">
        <Input label="New password" name="password" type="password" minLength={8} autoComplete="new-password" required />
        <Input label="Confirm password" name="confirm_password" type="password" minLength={8} autoComplete="new-password" required />
      </div>
      <ErrorMessage error={state.state === "error" ? state.message : null} />
      <SubmitButton className="pbn-primary-button mt-6 min-h-12 w-full">Update password</SubmitButton>
    </form>
  )
}

export default ResetPassword
