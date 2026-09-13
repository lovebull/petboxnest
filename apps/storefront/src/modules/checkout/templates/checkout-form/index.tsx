import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { listStoreCreditAccountsForCheckout } from "@lib/data/store-credit"
import { HttpTypes } from "@medusajs/types"
import Addresses from "@modules/checkout/components/addresses"
import Payment from "@modules/checkout/components/payment"
import Review from "@modules/checkout/components/review"
import Shipping from "@modules/checkout/components/shipping"
import StoreCredit from "@modules/checkout/components/store-credit"
import CheckoutResourceErrorState from "@modules/checkout/components/checkout-resource-error"
import { getCreditLineAmounts, getGiftCards } from "@lib/types/loyalty"

export default async function CheckoutForm({
  cart,
  customer,
  countryCode,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
  countryCode: string
}) {
  if (!cart) {
    return (
      <CheckoutResourceErrorState
        resource="cart"
        title="Your cart needs a quick refresh"
        message="We couldn't load the latest details. Try again before continuing to checkout."
      />
    )
  }

  const giftCards = getGiftCards(cart)
  const creditLineAmounts = getCreditLineAmounts(cart)
  const paidWithoutProvider =
    cart.total === 0 &&
    (giftCards.length > 0 ||
      creditLineAmounts.giftCard > 0 ||
      creditLineAmounts.storeCredit > 0)
  const hasExistingPaymentSession = Boolean(
    cart.payment_collection?.payment_sessions?.some(
      (session) => session.status === "pending"
    )
  )

  const [shippingMethods, paymentMethods, storeCreditAccounts] =
    await Promise.all([
      listCartShippingMethods(cart.id, countryCode),
      paidWithoutProvider
        ? Promise.resolve({ ok: true as const, data: [] })
        : listCartPaymentMethods(cart.region?.id ?? "", cart.id, countryCode),
      customer
        ? listStoreCreditAccountsForCheckout(
            cart.currency_code,
            cart.id,
            countryCode
          )
        : Promise.resolve({ ok: true as const, data: [] }),
    ])

  return (
    <div className="grid w-full grid-cols-1 gap-4 small:gap-5">
      <Addresses cart={cart} customer={customer} />

      {shippingMethods.ok && shippingMethods.data.length > 0 ? (
        <Shipping cart={cart} availableShippingMethods={shippingMethods.data} />
      ) : (
        <CheckoutResourceErrorState
          resource="shipping_options"
          title={
            shippingMethods.ok
              ? "No delivery option for this address"
              : "Delivery options didn't load"
          }
          message={
            shippingMethods.ok
              ? "We couldn't find a delivery option for this address. Check the address details, try again, or contact us for help."
              : shippingMethods.error.userMessage +
                " Your address and cart are still saved."
          }
          error={shippingMethods.ok ? undefined : shippingMethods.error}
          showEditAddress
        />
      )}

      {storeCreditAccounts.ok ? (
        storeCreditAccounts.data[0] &&
        Number(storeCreditAccounts.data[0].balance) > 0 ? (
          <StoreCredit cart={cart} account={storeCreditAccounts.data[0]} />
        ) : null
      ) : (
        <CheckoutResourceErrorState
          resource="store_credit"
          title="Store credit is unavailable"
          message="You can still continue with another payment method, or retry your balance check."
          error={storeCreditAccounts.error}
          compact
        />
      )}

      {paymentMethods.ok &&
      (paymentMethods.data.length > 0 || paidWithoutProvider) ? (
        <Payment cart={cart} availablePaymentMethods={paymentMethods.data} />
      ) : !paymentMethods.ok &&
        (paidWithoutProvider || hasExistingPaymentSession) ? (
        <>
          <CheckoutResourceErrorState
            resource="payment_providers"
            title="Payment list couldn't be refreshed"
            message="Your selected payment session is still available, so you can continue or retry the provider list."
            error={paymentMethods.error}
            compact
          />
          <Payment cart={cart} availablePaymentMethods={[]} />
        </>
      ) : (
        <CheckoutResourceErrorState
          resource="payment_providers"
          title={
            paymentMethods.ok
              ? "No payment method is configured"
              : "Payment options are unavailable"
          }
          message={
            paymentMethods.ok
              ? "No payment method is configured for this region right now. Please retry or contact us before placing your order."
              : paymentMethods.error.userMessage +
                " Everything already entered is still saved."
          }
          error={paymentMethods.ok ? undefined : paymentMethods.error}
        />
      )}

      <Review cart={cart} />
    </div>
  )
}
