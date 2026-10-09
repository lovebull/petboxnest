import { ChevronDown, ShieldCheck } from "@medusajs/icons"

import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import GiftCardCode from "@modules/checkout/components/gift-card-code"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"

const CheckoutSummary = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const shippingCountryCode = cart.shipping_address?.country_code?.toLowerCase()
  const isInternationalOrder = Boolean(
    shippingCountryCode && shippingCountryCode !== "us",
  )

  return (
    <aside className="small:sticky small:top-6" aria-label="Order summary">
      <details
        open
        className="group overflow-hidden rounded-[24px] border border-[#E6E8EC] bg-white shadow-[0_8px_24px_rgba(32,36,51,0.07)] small:rounded-[28px]"
      >
        <summary className="pbn-focus flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 bg-white px-5 py-4 font-bold text-ink small:px-6 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-yellow text-ink">
              {cart.items?.reduce((total, item) => total + item.quantity, 0) ||
                0}
            </span>
            <span>
              <span className="block font-display text-xl font-bold">
                Order summary
              </span>
              <span className="block text-xs font-medium text-muted">
                Show or hide order details
              </span>
            </span>
          </span>
          <ChevronDown
            className="transition-transform duration-200 group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>

        <div className="border-t border-[#E6E8EC] px-5 pb-5 pt-2 small:px-6 small:pb-6">
          <ItemsPreviewTemplate cart={cart} />
          <Divider className="my-5" />
          <CartTotals totals={cart} variant="cart" />
          <div className="mt-4">
            <DiscountCode cart={cart} variant="cart" />
          </div>
          <div className="mt-3">
            <GiftCardCode cart={cart} />
          </div>
          {isInternationalOrder && (
            <div className="mt-4 rounded-[16px] border border-yellow bg-yellow/20 p-4 text-sm leading-5 text-ink">
              <p className="font-bold">International order</p>
              <p className="mt-1 text-muted">
                Import duties and taxes may be collected upon delivery.
              </p>
            </div>
          )}
          <div className="mt-4 flex items-start gap-3 rounded-[16px] bg-mint/60 p-4 text-sm leading-5 text-ink">
            <ShieldCheck
              className="mt-0.5 shrink-0 text-brand"
              aria-hidden="true"
            />
            <p>
              Your checkout is secure. Final shipping and tax totals stay
              visible before you place the order.
            </p>
          </div>
        </div>
      </details>
    </aside>
  )
}

export default CheckoutSummary
