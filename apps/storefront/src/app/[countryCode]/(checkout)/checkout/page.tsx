import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import CheckoutProgress from "@modules/checkout/components/checkout-progress"
import { Metadata } from "next"
import { redirect } from "next/navigation"
import { createPrivateMetadata } from "@lib/util/seo-metadata"

export const metadata: Metadata = createPrivateMetadata(
  "Secure Checkout | PetBoxNest",
  "Confirm delivery and payment details for your PetBoxNest order."
)

const checkoutHeroCopy = {
  address: {
    title: "Where should we send it?",
    description: "Add your contact and delivery details to get started.",
  },
  delivery: {
    title: "Choose your delivery.",
    description: "Select the delivery option that works best for you.",
  },
  payment: {
    title: "You're one step away.",
    description: "Review your order and pay securely.",
  },
} as const

export default async function Checkout({
  params,
  searchParams,
}: {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ step?: string | string[] }>
}) {
  const { countryCode } = await params
  const requestedStep = (await searchParams).step
  const normalizedStep = Array.isArray(requestedStep)
    ? requestedStep[0]
    : requestedStep
  const currentStep =
    normalizedStep === "delivery"
      ? "delivery"
      : normalizedStep === "payment" || normalizedStep === "review"
      ? "payment"
      : "address"
  const heroCopy = checkoutHeroCopy[currentStep]
  const cart = await retrieveCart()

  if (!cart?.items?.length) {
    redirect(`/${countryCode}/cart?checkout_notice=empty-cart`)
  }

  const customer = await retrieveCustomer()

  return (
    <main className="overflow-x-clip bg-cream pb-16 text-ink small:pb-24">
      <div className="content-container pt-8 xsmall:pt-10 small:pt-14">
        <section className="relative overflow-hidden rounded-[24px] border border-[#E6E8EC] bg-mint px-5 py-4 xsmall:px-7 small:rounded-[32px] small:px-8 small:py-5">
          <div
            className="absolute -right-14 -top-16 h-44 w-44 rounded-full bg-yellow/80"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-white/45"
            aria-hidden="true"
          />
          <div className="relative max-w-[760px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
              Secure checkout
            </p>
            <h1 className="mt-1.5 font-display text-[28px] font-bold leading-[1.1] tracking-[-0.04em] xsmall:text-[34px]">
              {heroCopy.title}
            </h1>
            <p className="mt-1.5 max-w-[620px] text-sm leading-5 text-muted">
              {heroCopy.description}
            </p>
            <CheckoutProgress />
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 items-start gap-6 small:mt-8 small:grid-cols-[minmax(0,1fr)_minmax(340px,416px)] small:gap-8 medium:gap-10">
          <div className="min-w-0 order-2 small:order-1">
            <PaymentWrapper cart={cart}>
              <CheckoutForm
                cart={cart}
                customer={customer}
                countryCode={countryCode}
              />
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
