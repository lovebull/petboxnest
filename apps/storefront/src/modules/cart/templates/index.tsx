import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import CheckoutRedirectNotice from "../components/checkout-redirect-notice"
import { HttpTypes } from "@medusajs/types"

const CartTemplate = ({
  cart,
  customer,
  showEmptyCheckoutNotice = false,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
  showEmptyCheckoutNotice?: boolean
}) => {
  return (
    <main className="overflow-x-clip bg-cream text-ink">
      <div className="pbn-container py-10 small:py-16" data-testid="cart-container">
        {showEmptyCheckoutNotice && <CheckoutRedirectNotice />}
        {cart?.items?.length ? (
          <div className="grid gap-8 small:grid-cols-[minmax(0,1fr)_380px] small:items-start medium:grid-cols-[minmax(0,1fr)_420px]">
            <section className="min-w-0 space-y-5">
              <div className="rounded-[28px] bg-brand px-5 py-8 text-white shadow-[0_16px_40px_rgba(32,36,51,0.12)] xsmall:px-7 small:px-8 small:py-10">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-yellow">
                  Cart review
                </p>
                <h1 className="mt-3 font-display text-[34px] font-bold leading-tight xsmall:text-[42px]">
                  Ready for their next favorite spot?
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/85">
                  Check quantities, confirm variants, and head to secure
                  checkout when everything looks right.
                </p>
              </div>

              {!customer && (
                <SignInPrompt />
              )}
              <ItemsTemplate cart={cart} />
            </section>
            <aside className="relative min-w-0">
              <div className="small:sticky small:top-24">
                {cart && cart.region && (
                  <Summary cart={cart} />
                )}
              </div>
            </aside>
          </div>
        ) : (
          <EmptyCartMessage />
        )}
      </div>
    </main>
  )
}

export default CartTemplate
