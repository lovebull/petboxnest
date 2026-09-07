"use server"

import { listCartOptions, retrieveCart } from "./cart"
import { retrieveCustomer } from "./customer"
import { ensureSessionCacheId } from "./cookies"

export async function retrieveLayoutSession() {
  // Create visitor-scoped cache metadata only after hydration. Keeping this
  // cookie out of middleware allows public HTML responses to remain cacheable.
  await ensureSessionCacheId()

  const [customer, cart] = await Promise.all([
    retrieveCustomer(),
    retrieveCart(),
  ])

  if (!cart) {
    return { customer, cart: null, shippingOptions: [] }
  }

  const { shipping_options: shippingOptions } = await listCartOptions()

  return { customer, cart, shippingOptions }
}
