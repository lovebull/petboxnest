import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import CheckoutProgress from "@modules/checkout/components/checkout-progress"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { createPrivateMetadata } from "@lib/util/seo-metadata"

export const metadata: Metadata = createPrivateMetadata(
  "Secure Checkout | PetBoxNest",
  "Confirm delivery and payment details for your PetBoxNest order.",
)

export default async function Checkout() {
  const cart = await retrieveCart()

  if (!cart) {
    return notFound()
  }

  const customer = await retrieveCustomer()

  return (
    <main className="overflow-x-clip bg-cream pb-16 text-ink small:pb-24">
      <div className="content-container pt-8 xsmall:pt-10 small:pt-14">
        <section className="relative overflow-hidden rounded-[24px] border border-[#E6E8EC] bg-mint px-5 py-7 xsmall:px-7 small:rounded-[32px] small:px-10 small:py-9">
          <div
            className="absolute -right-14 -top-16 h-44 w-44 rounded-full bg-yellow/80"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-white/45"
            aria-hidden="true"
          />
          <div className="relative max-w-[760px]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
              Secure checkout
            </p>
            <h1 className="mt-3 text-balance font-display text-[34px] font-bold leading-[1.05] tracking-[-0.04em] xsmall:text-[42px] small:text-[54px]">
              One last step to a happier nest.
            </h1>
            <p className="mt-3 max-w-[620px] text-base leading-7 text-muted">
              Confirm where it is going, choose delivery, and finish securely.
              We will keep every cost clear along the way.
            </p>
            <CheckoutProgress />
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 items-start gap-6 small:mt-8 small:grid-cols-[minmax(0,1fr)_minmax(340px,416px)] small:gap-8 medium:gap-10">
          <div className="min-w-0 order-2 small:order-1">
            <PaymentWrapper cart={cart}>
              <CheckoutForm cart={cart} customer={customer} />
            </PaymentWrapper>
          </div>
          <div className="order-1 min-w-0 small:order-2">
            <CheckoutSummary cart={cart} />
          </div>
        </div>
      </div>
    </main>
  )
}
