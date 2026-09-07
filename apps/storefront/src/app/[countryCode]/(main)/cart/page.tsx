import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import CartTemplate from "@modules/cart/templates"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { createPrivateMetadata } from "@lib/util/seo-metadata"

export const metadata: Metadata = createPrivateMetadata(
  "Shopping Cart | PetBoxNest",
  "Review the items in your PetBoxNest shopping cart.",
)

export default async function Cart() {
  const cart = await retrieveCart().catch((error) => {
    console.error(error)
    return notFound()
  })

  const customer = await retrieveCustomer()

  return <CartTemplate cart={cart} customer={customer} />
}
