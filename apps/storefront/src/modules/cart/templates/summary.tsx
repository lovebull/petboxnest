"use client"

import { Button, Heading } from "@modules/common/components/ui"
import {
  ArrowRight,
  CheckCircleSolid,
  CreditCard,
  TruckFast,
} from "@medusajs/icons"
import type React from "react"

import CartTotals from "@modules/common/components/cart-totals"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)

  return (
    <section className="rounded-[24px] border border-[#E6E8EC] bg-white p-5 shadow-[0_16px_40px_rgba(32,36,51,0.1)] xsmall:p-6">
      <div className="rounded-[20px] bg-cream p-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
          Order summary
        </p>
        <Heading
          level="h2"
          className="mt-2 font-display text-3xl font-bold leading-tight text-ink"
        >
          Checkout nest
        </Heading>
        <p className="mt-2 text-sm leading-6 text-muted">
          Totals update as quantities and promotions change.
        </p>
      </div>

      <div className="mt-5">
        <DiscountCode cart={cart} variant="cart" />
      </div>

      <div className="mt-5">
        <CartTotals totals={cart} variant="cart" />
      </div>

      <LocalizedClientLink
        href={"/checkout?step=" + step}
        data-testid="checkout-button"
        className="block"
      >
        <Button className="pbn-primary-button mt-5 min-h-14 w-full gap-2 text-base">
          Go to checkout
          <ArrowRight />
        </Button>
      </LocalizedClientLink>

      <div className="mt-5 grid gap-3 text-sm text-muted">
        <TrustItem icon={<CreditCard />} text="Secure checkout" />
        <TrustItem icon={<TruckFast />} text="Shipping calculated at checkout" />
        <TrustItem icon={<CheckCircleSolid />} text="Easy order review before payment" />
      </div>
    </section>
  )
}

const TrustItem = ({
  icon,
  text,
}: {
  icon: React.ReactNode
  text: string
}) => {
  return (
    <div className="flex items-center gap-3 rounded-[16px] bg-mist px-4 py-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white text-brand">
        {icon}
      </span>
      <span className="font-semibold text-ink">{text}</span>
    </div>
  )
}

export default Summary
