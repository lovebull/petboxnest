"use client"

import { useActionState } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)

  return (
    <div
      className="flex w-full max-w-sm flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="mb-4 text-center font-display text-3xl font-bold text-ink">
        Become a PetBoxNest member
      </h1>
      <p className="mb-6 text-center text-base leading-7 text-muted">
        Create your PetBoxNest profile and keep checkout details ready for the
        next cozy upgrade.
      </p>
      {message?.state === "verification_required" && (
        <div
          className="mb-4 w-full rounded-[18px] border border-[#E6E8EC] bg-cream p-4 text-center text-base leading-7 text-ink"
          data-testid="register-verification-message"
        >
          We sent a verification link to <strong>{message.email}</strong>.
          Please check your inbox to verify your email, then sign in.
        </div>
      )}
      <form className="w-full flex flex-col" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="First name"
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label="Last name"
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          <Input
            label="Email"
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label="Password"
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
        </div>
        <ErrorMessage
          error={message?.state === "error" ? message.error : null}
          data-testid="register-error"
        />
        <span className="mt-6 text-center text-sm leading-6 text-muted">
          By creating an account, you agree to PetBoxNest&apos;s{" "}
          <LocalizedClientLink
            href="/privacy-policy"
            className="pbn-focus rounded-sm font-bold text-brand underline decoration-2 underline-offset-4"
          >
            Privacy Policy
          </LocalizedClientLink>{" "}
          and{" "}
          <LocalizedClientLink
            href="/terms-of-service"
            className="pbn-focus rounded-sm font-bold text-brand underline decoration-2 underline-offset-4"
          >
            Terms of Service
          </LocalizedClientLink>
          .
        </span>
        <SubmitButton
          className="pbn-primary-button mt-6 w-full"
          data-testid="register-button"
        >
          Join
        </SubmitButton>
      </form>
      <span className="mt-6 text-center text-sm text-muted">
        Already a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="pbn-focus rounded-sm font-bold text-brand underline decoration-2 underline-offset-4"
        >
          Sign in
        </button>
        .
      </span>
    </div>
  )
}

export default Register
