import { Heading, Text } from "@modules/common/components/ui"
import { ArrowRight, ShoppingBag } from "@medusajs/icons"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

const EmptyCartMessage = () => {
  return (
    <section
      className="grid min-h-[560px] gap-8 rounded-[32px] bg-brand p-5 text-white shadow-[0_16px_40px_rgba(32,36,51,0.12)] xsmall:p-8 small:grid-cols-[minmax(0,1fr)_360px] small:items-center small:p-12"
      data-testid="empty-cart-message"
    >
      <div>
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-yellow">
          <ShoppingBag />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-yellow">
          Your cart
        </p>
        <Heading
          level="h1"
          className="mt-3 font-display text-[38px] font-bold leading-tight xsmall:text-[48px] small:text-[64px]"
        >
          Your cart is ready for a little comfort.
        </Heading>
        <Text className="mt-5 max-w-2xl text-base leading-7 text-white/85 xsmall:text-lg">
          You don&apos;t have anything in your cart. Let&apos;s change that
          with practical products for messy paws, cozy naps, and calmer homes.
        </Text>
        <div className="mt-8 flex flex-col gap-3 xsmall:flex-row">
          <LocalizedClientLink href="/store" className="pbn-focus inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-white px-6 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:bg-cream motion-reduce:transition-none">
            Explore products
            <ArrowRight />
          </LocalizedClientLink>
          <LocalizedClientLink href="/#best-sellers" className="pbn-focus inline-flex min-h-12 items-center justify-center rounded-[14px] border-2 border-white/40 px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:border-white motion-reduce:transition-none">
            Shop best sellers
          </LocalizedClientLink>
        </div>
      </div>

      <div className="rounded-[24px] bg-white p-5 text-ink">
        <p className="font-display text-2xl font-bold">
          A smoother checkout starts here.
        </p>
        <div className="mt-5 grid gap-3 text-sm font-bold text-muted">
          <span className="rounded-[16px] bg-cream px-4 py-3">
            Review variants before payment
          </span>
          <span className="rounded-[16px] bg-cream px-4 py-3">
            Save addresses from your account
          </span>
          <span className="rounded-[16px] bg-cream px-4 py-3">
            Secure checkout when you are ready
          </span>
        </div>
      </div>
    </section>
  )
}

export default EmptyCartMessage
