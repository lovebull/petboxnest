"use client"
import { setAddresses } from "@lib/data/cart"
import useToggleState from "@lib/hooks/use-toggle-state"
import compareAddresses from "@lib/util/compare-addresses"
import { CheckCircleSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@modules/common/components/ui"
import Spinner from "@modules/common/icons/spinner"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useActionState } from "react"
import BillingAddress from "../billing_address"
import ErrorMessage from "../error-message"
import ShippingAddress from "../shipping-address"
import { SubmitButton } from "../submit-button"

const Addresses = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "address"

  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    cart?.shipping_address && cart?.billing_address
      ? compareAddresses(cart?.shipping_address, cart?.billing_address)
      : true
  )

  const handleEdit = () => {
    router.push(pathname + "?step=address")
  }

  const [message, formAction] = useActionState(setAddresses, null)

  return (
    <section
      className={`rounded-[24px] border bg-white p-5 shadow-[0_8px_24px_rgba(32,36,51,0.05)] xsmall:p-6 small:rounded-[28px] small:p-8 ${
        isOpen ? "border-brand/30" : "border-[#E6E8EC]"
      }`}
      aria-labelledby="checkout-address-heading"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <Heading
          level="h2"
          id="checkout-address-heading"
          className="flex items-center gap-3 font-display text-[26px] font-bold leading-tight text-ink xsmall:text-[30px]"
        >
          <span
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-[14px] text-sm ${
              isOpen ? "bg-brand text-white" : "bg-mint text-ink"
            }`}
            aria-hidden="true"
          >
            {!isOpen ? <CheckCircleSolid /> : "1"}
          </span>
          <span>
            Shipping Address
            <span className="mt-1 block font-sans text-sm font-normal text-muted">
              Where should we send their new favorite thing?
            </span>
          </span>
        </Heading>
        {!isOpen && cart?.shipping_address && (
          <Text>
            <button
              onClick={handleEdit}
              className="pbn-focus inline-flex min-h-11 items-center rounded-[14px] bg-cream px-4 text-sm font-bold text-brand transition-colors hover:bg-mist hover:text-brand-dark"
              data-testid="edit-address-button"
            >
              Edit
            </button>
          </Text>
        )}
      </div>
      {isOpen ? (
        <form action={formAction}>
          <div>
            <ShippingAddress
              customer={customer}
              checked={sameAsBilling}
              onChange={toggleSameAsBilling}
              cart={cart}
            />

            {!sameAsBilling && (
              <div>
                <Heading
                  level="h2"
                  className="pb-5 pt-8 font-display text-2xl font-bold text-ink"
                >
                  Billing address
                </Heading>

                <BillingAddress cart={cart} />
              </div>
            )}
            <SubmitButton
              size="large"
              className="mt-6 min-h-12 w-full rounded-[14px] !bg-brand px-6 text-base font-bold !text-white hover:!bg-brand-dark xsmall:w-auto"
              data-testid="submit-address-button"
            >
              Continue to delivery
            </SubmitButton>
            <ErrorMessage error={message} data-testid="address-error-message" />
          </div>
        </form>
      ) : (
        <div>
          <div className="text-sm">
            {cart && cart.shipping_address ? (
              <div>
                <div className="grid gap-4 xsmall:grid-cols-2 medium:grid-cols-3">
                  <div
                    className="flex min-w-0 flex-col rounded-[16px] bg-cream p-4"
                    data-testid="shipping-address-summary"
                  >
                    <Text className="mb-1 text-sm font-bold text-ink">
                      Shipping Address
                    </Text>
                    <Text className="text-sm leading-5 text-muted">
                      {cart.shipping_address.first_name}{" "}
                      {cart.shipping_address.last_name}
                    </Text>
                    <Text className="text-sm leading-5 text-muted">
                      {cart.shipping_address.address_1}{" "}
                      {cart.shipping_address.address_2}
                    </Text>
                    <Text className="text-sm leading-5 text-muted">
                      {cart.shipping_address.postal_code},{" "}
                      {cart.shipping_address.city}
                    </Text>
                    <Text className="text-sm leading-5 text-muted">
                      {cart.shipping_address.country_code?.toUpperCase()}
                    </Text>
                  </div>

                  <div
                    className="flex min-w-0 flex-col rounded-[16px] bg-mist p-4"
                    data-testid="shipping-contact-summary"
                  >
                    <Text className="mb-1 text-sm font-bold text-ink">
                      Contact
                    </Text>
                    <Text className="break-words text-sm leading-5 text-muted">
                      {cart.shipping_address.phone}
                    </Text>
                    <Text className="break-words text-sm leading-5 text-muted">
                      {cart.email}
                    </Text>
                  </div>

                  <div
                    className="flex min-w-0 flex-col rounded-[16px] bg-mist p-4 xsmall:col-span-2 medium:col-span-1"
                    data-testid="billing-address-summary"
                  >
                    <Text className="mb-1 text-sm font-bold text-ink">
                      Billing Address
                    </Text>

                    {sameAsBilling ? (
                      <Text className="text-sm leading-5 text-muted">
                        Billing and delivery address are the same.
                      </Text>
                    ) : (
                      <>
                        <Text className="text-sm leading-5 text-muted">
                          {cart.billing_address?.first_name}{" "}
                          {cart.billing_address?.last_name}
                        </Text>
                        <Text className="text-sm leading-5 text-muted">
                          {cart.billing_address?.address_1}{" "}
                          {cart.billing_address?.address_2}
                        </Text>
                        <Text className="text-sm leading-5 text-muted">
                          {cart.billing_address?.postal_code},{" "}
                          {cart.billing_address?.city}
                        </Text>
                        <Text className="text-sm leading-5 text-muted">
                          {cart.billing_address?.country_code?.toUpperCase()}
                        </Text>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <Spinner />
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export default Addresses
