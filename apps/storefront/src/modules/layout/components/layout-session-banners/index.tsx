"use client"

import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"
import { useLayoutSession } from "@modules/layout/components/layout-session-provider"

export default function LayoutSessionBanners() {
  const { customer, cart, shippingOptions } = useLayoutSession()

  if (!cart) {
    return null
  }

  return (
    <>
      {customer && <CartMismatchBanner customer={customer} cart={cart} />}
      <FreeShippingPriceNudge
        variant="popup"
        cart={cart}
        shippingOptions={shippingOptions}
      />
    </>
  )
}
