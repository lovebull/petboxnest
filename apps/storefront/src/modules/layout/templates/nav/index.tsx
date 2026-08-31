import { Suspense } from "react"

import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { HttpTypes, StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import User from "@modules/common/icons/user"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"

type NavProps = {
  customer: HttpTypes.StoreCustomer | null
}

export default async function Nav({ customer }: NavProps) {
  const [regions, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    getLocale(),
  ])

  const locales = null

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <div className="flex h-9 items-center justify-center bg-[#0b1110] px-4 text-center text-[13px] font-medium tracking-[0.08em] text-white small:text-[17px]">
        Free shipping on purchases $100+
      </div>
      <header className="relative h-16 mx-auto border-b duration-200 bg-white border-ui-border-base">
        <nav className="content-container txt-xsmall-plus text-ui-fg-subtle flex items-center justify-between w-full h-full text-small-regular">
          <div className="flex-1 basis-0 h-full flex items-center small:hidden">
            <div className="h-full">
              <SideMenu regions={regions} locales={locales} currentLocale={currentLocale} />
            </div>
          </div>
          <div className="hidden small:flex flex-1 basis-0 h-full items-center gap-x-8 text-base-regular">
            <LocalizedClientLink
              href="/"
              className="hover:text-ui-fg-base"
              data-testid="desktop-nav-home-link"
            >
              Home
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/store"
              className="hover:text-ui-fg-base"
              data-testid="desktop-nav-store-link"
            >
              Store
            </LocalizedClientLink>
             <LocalizedClientLink
              href="/about-us"
              className="hover:text-ui-fg-base"
              data-testid="desktop-nav-account-link"
            >
              About
            </LocalizedClientLink>
          </div>

          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus hover:text-ui-fg-base uppercase"
              data-testid="nav-store-link"
            >
              Petboxnest
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-ui-fg-base flex gap-2"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Cart (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
            <LocalizedClientLink
              href="/account"
              className="flex min-h-11 min-w-11 items-center justify-center hover:text-ui-fg-base small:min-h-0 small:min-w-0"
              data-testid="nav-account-link"
              aria-label={customer ? "Account" : "Sign in to account"}
            >
              {customer ? (
                <span>Account</span>
              ) : (
                <>
                  <User size="18" aria-hidden="true" />
                  <span className="sr-only">Sign in to account</span>
                </>
              )}
            </LocalizedClientLink>
          </div>
        </nav>
      </header>
    </div>
  )
}
