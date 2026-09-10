import ResetPassword from "@modules/account/components/reset-password"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ email?: string; token?: string }> }) {
  const { email = "", token = "" } = await searchParams
  const validLink = Boolean(email && token)

  return (
    <div className="bg-cream px-4 py-14 small:py-20">
      <div className="mx-auto w-full max-w-lg rounded-[24px] border border-[#E6E8EC] bg-white p-6 xsmall:p-9">
        <p className="text-center text-xs font-bold uppercase tracking-[0.14em] text-brand">PetBoxNest account security</p>
        {validLink ? (
          <>
            <h1 className="mt-3 text-center font-display text-3xl font-bold text-ink">Choose a new password</h1>
            <p className="mb-7 mt-3 text-center text-base leading-7 text-muted">Use at least eight characters. Your reset link is single-use and expires after 15 minutes.</p>
            <ResetPassword email={email} token={token} />
          </>
        ) : (
          <div className="text-center">
            <h1 className="mt-3 font-display text-3xl font-bold text-ink">This link is incomplete</h1>
            <p className="mt-4 text-base leading-7 text-muted">Return to sign in and request a new password reset email.</p>
            <LocalizedClientLink href="/account" className="pbn-primary-button mt-7 inline-flex min-h-12 items-center justify-center px-7">Return to sign in</LocalizedClientLink>
          </div>
        )}
      </div>
    </div>
  )
}
