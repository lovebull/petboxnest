import { Button, Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="grid gap-4 rounded-[22px] border border-[#E6E8EC] bg-white p-5 shadow-[0_8px_24px_rgba(32,36,51,0.04)] xsmall:grid-cols-[minmax(0,1fr)_auto] xsmall:items-center">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
          Faster next time
        </p>
        <Heading level="h2" className="mt-2 font-display text-2xl font-bold text-ink">
          Already have an account?
        </Heading>
        <Text className="mt-2 text-base leading-7 text-muted">
          Sign in to use saved addresses and keep your cart connected to your
          PetBoxNest profile.
        </Text>
      </div>
      <div>
        <LocalizedClientLink href="/account">
          <Button
            variant="secondary"
            className="min-h-12 w-full rounded-[14px] border-[#E6E8EC] px-6 font-bold hover:border-brand hover:bg-cream hover:text-brand xsmall:w-auto"
            data-testid="sign-in-button"
          >
            Sign in
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
