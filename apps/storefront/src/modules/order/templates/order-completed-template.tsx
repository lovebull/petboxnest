import { Heading, Text } from "@modules/common/components/ui"
import { cookies as nextCookies } from "next/headers"

import CartTotals from "@modules/common/components/cart-totals"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import PaymentDetails from "@modules/order/components/payment-details"
import { HttpTypes } from "@medusajs/types"
import OrderAnalytics from "../components/order-analytics"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()

  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  return (
    <div className="min-h-[calc(100vh-64px)] bg-cream py-8 xsmall:py-12">
      <OrderAnalytics orderId={order.id} />
      <div className="pbn-container flex w-full flex-col gap-6 small:gap-8">
        {isOnboarding && <OnboardingCta orderId={order.id} />}
        <section
          className="relative overflow-hidden rounded-[24px] bg-brand px-5 py-6 text-white shadow-[0_12px_32px_rgba(32,36,51,0.10)] xsmall:px-7 small:rounded-[28px] small:px-9 small:py-8"
          data-testid="order-confirmation-hero"
        >
          <div className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full bg-yellow/25" />
          <div className="pointer-events-none absolute -bottom-20 left-1/2 h-32 w-32 rounded-full bg-white/10" />
          <div className="relative max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-yellow">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-yellow text-brand">✓</span>
              Order confirmed
            </div>
            <Heading
              level="h1"
              className="font-display text-3xl font-bold leading-tight text-white small:text-4xl"
            >
              Thank you!
            </Heading>
            <Text className="mt-1 text-lg font-semibold text-white small:text-xl">
              Your order was placed successfully.
            </Text>
            <Text className="mt-3 max-w-2xl text-sm leading-6 text-white/80 small:text-base">
              Their next cozy moment is on its way. We saved the details below so
              you can quickly review what is coming to your home.
            </Text>
            <div className="mt-5 flex flex-col gap-3 xsmall:flex-row">
              <LocalizedClientLink
                href="/store"
                className="pbn-primary-button !bg-white !text-brand hover:!bg-cream"
              >
                Continue shopping
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/account/orders"
                className="pbn-secondary-button !border-white/60 !bg-transparent !text-white hover:!bg-white/10"
              >
                View my orders
              </LocalizedClientLink>
            </div>
          </div>
        </section>
        <div
          className="grid gap-6 small:gap-8 large:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]"
          data-testid="order-complete-container"
        >
          <div className="flex min-w-0 flex-col gap-6 small:gap-8">
            <section className="rounded-[24px] border border-[#E6E8EC] bg-white p-5 shadow-[0_8px_24px_rgba(32,36,51,0.05)] small:rounded-[28px] small:p-8">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Your order</p>
                  <Heading level="h2" className="mt-2 font-display text-2xl font-bold text-ink">Order details</Heading>
                </div>
                <span className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-ink">Received</span>
              </div>
              <OrderDetails order={order} />
            </section>
            <section className="rounded-[24px] border border-[#E6E8EC] bg-white p-5 shadow-[0_8px_24px_rgba(32,36,51,0.05)] small:rounded-[28px] small:p-8">
              <Heading level="h2" className="mb-5 font-display text-2xl font-bold text-ink">Items in your nest</Heading>
              <Items order={order} />
            </section>
            <ShippingDetails order={order} />
            <PaymentDetails order={order} />
            <Help />
          </div>
          <aside className="h-fit large:sticky large:top-24">
            <div className="rounded-[24px] border border-[#E6E8EC] bg-white p-5 shadow-[0_8px_24px_rgba(32,36,51,0.05)] small:rounded-[28px] small:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">A clear little recap</p>
              <Heading level="h2" className="mt-2 mb-5 font-display text-2xl font-bold text-ink">Order summary</Heading>
              <CartTotals totals={order} variant="cart" />
              <div className="mt-5 rounded-[16px] bg-mist p-4 text-sm leading-6 text-muted">
                We will email shipping updates to <span className="font-bold text-ink">{order.email}</span> when your order moves.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
