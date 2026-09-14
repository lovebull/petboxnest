import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import CartTemplate from "@modules/cart/templates"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { createPrivateMetadata } from "@lib/util/seo-metadata"
import type { CartPaymentError } from "@modules/cart/components/payment-failure-notice"

export const metadata: Metadata = createPrivateMetadata(
  "Shopping Cart | PetBoxNest",
  "Review the items in your PetBoxNest shopping cart."
)

export default async function Cart({
  searchParams,
}: {
  searchParams: Promise<{
    checkout_notice?: string
    recovery?: string
    error?: string
  }>
}) {
  const cart = await retrieveCart().catch((error) => {
    console.error(error)
    return notFound()
  })

  const customer = await retrieveCustomer()
  const {
    checkout_notice: checkoutNotice,
    recovery,
    error,
  } = await searchParams
  const paymentError: CartPaymentError | undefined =
    error === "payment_failed" || error === "order_failed" ? error : undefined

  return (
    <CartTemplate
      cart={cart}
      customer={customer}
      showEmptyCheckoutNotice={checkoutNotice === "empty-cart"}
      recoveryStatus={recovery}
      paymentError={paymentError}
    />
  )
}
