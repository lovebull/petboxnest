import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"
import MedusaCTA from "@modules/layout/components/medusa-cta"
import { ShieldCheck } from "@medusajs/icons"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative w-full bg-cream text-ink small:min-h-screen">
      <header className="h-[72px] border-b border-[#E6E8EC] bg-white">
        <nav className="content-container flex h-full items-center justify-between gap-4">
          <LocalizedClientLink
            href="/cart"
            className="pbn-focus flex min-h-11 flex-1 basis-0 items-center gap-2 rounded-lg text-sm font-bold text-muted transition-colors hover:text-brand"
            data-testid="back-to-cart-link"
          >
            <ChevronDown className="rotate-90" size={16} />
            <span className="hidden xsmall:block">Back to shopping cart</span>
            <span className="block xsmall:hidden">Back</span>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            className="pbn-focus rounded-lg font-display text-xl font-extrabold tracking-[-0.045em] text-ink transition-colors hover:text-brand xsmall:text-2xl"
            data-testid="store-link"
          >
            PetBox<span className="text-brand">Nest</span>
          </LocalizedClientLink>
          <div className="flex flex-1 basis-0 items-center justify-end gap-2 text-sm font-bold text-muted">
            <ShieldCheck className="text-brand" aria-hidden="true" />
            <span className="hidden xsmall:inline">Secure checkout</span>
          </div>
        </nav>
      </header>
      <div className="relative" data-testid="checkout-container">
        {children}
      </div>
      <div className="flex w-full items-center justify-center border-t border-[#E6E8EC] bg-white py-5">
        <MedusaCTA />
      </div>
    </div>
  )
}
