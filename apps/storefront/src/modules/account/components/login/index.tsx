import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)

  return (
    <div
      className="flex w-full max-w-sm flex-col items-center"
      data-testid="login-page"
    >
      <h1 className="mb-4 text-center font-display text-3xl font-bold text-ink">
        Welcome back
      </h1>
      <p className="mb-8 text-center text-base leading-7 text-muted">
        Sign in to access an enhanced shopping experience.
      </p>
      {message?.state === "verification_required" && (
        <div
          className="mb-6 w-full rounded-[18px] border border-[#E6E8EC] bg-cream p-4 text-center text-base leading-7 text-ink"
          data-testid="login-verification-message"
        >
          We sent a verification link to <strong>{message.email}</strong>.
          Please verify your email, then sign in.
        </div>
      )}
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <ErrorMessage
          error={message?.state === "error" ? message.error : null}
          data-testid="login-error-message"
        />
        <div className="mt-3 text-right">
          <button
            type="button"
            onClick={() => setCurrentView(LOGIN_VIEW.FORGOT_PASSWORD)}
            className="pbn-focus min-h-11 rounded-sm px-1 text-sm font-bold text-brand underline decoration-2 underline-offset-4"
          >
            Forgot password?
          </button>
        </div>
        <SubmitButton
          data-testid="sign-in-button"
          className="pbn-primary-button mt-6 w-full"
        >
          Sign in
        </SubmitButton>
      </form>
      <span className="mt-6 text-center text-sm text-muted">
        Not a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="pbn-focus rounded-sm font-bold text-brand underline decoration-2 underline-offset-4"
          data-testid="register-button"
        >
          Join us
        </button>
        .
      </span>
    </div>
  )
}

export default Login
