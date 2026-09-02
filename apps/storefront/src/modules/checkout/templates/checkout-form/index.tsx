import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { listStoreCreditAccounts } from "@lib/data/store-credit"
import { HttpTypes } from "@medusajs/types"
import Addresses from "@modules/checkout/components/addresses"
import Payment from "@modules/checkout/components/payment"
import Review from "@modules/checkout/components/review"
import Shipping from "@modules/checkout/components/shipping"
import StoreCredit from "@modules/checkout/components/store-credit"

export default async function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  if (!cart) {
    return null
  }

  const shippingMethods = await listCartShippingMethods(cart.id)
  const paymentMethods = await listCartPaymentMethods(cart.region?.id ?? "")
  const storeCreditAccounts = customer
    ? await listStoreCreditAccounts(cart.currency_code)
    : []

  if (!shippingMethods || !paymentMethods) {
    return null
  }

  return (
    <div className="grid w-full grid-cols-1 gap-4 small:gap-5">
      <Addresses cart={cart} customer={customer} />

      <Shipping cart={cart} availableShippingMethods={shippingMethods} />

      {storeCreditAccounts[0] && Number(storeCreditAccounts[0].balance) > 0 && (
        <StoreCredit cart={cart} account={storeCreditAccounts[0]} />
      )}

      <Payment cart={cart} availablePaymentMethods={paymentMethods} />

      <Review cart={cart} />
    </div>
  )
}
