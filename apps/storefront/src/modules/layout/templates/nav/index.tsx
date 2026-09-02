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
    <div className="sticky inset-x-0 top-0 z-50 text-ink">
      <div className="flex min-h-9 items-center justify-center bg-brand px-4 py-2 text-center text-xs font-bold tracking-[0.04em] text-white small:text-sm">
        Free shipping on purchases $100+ · Less cleanup, more cuddle time
      </div>
      <header className="relative h-[72px] border-b border-[#E6E8EC] bg-white/95 backdrop-blur-md small:h-20">
        <nav className="pbn-container flex h-full w-full items-center justify-between text-sm font-semibold">
          <div className="flex h-full flex-1 basis-0 items-center small:hidden">
            <div className="h-full">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
              />
            </div>
          </div>
          <div className="hidden h-full flex-1 basis-0 items-center gap-x-6 small:flex">
            <LocalizedClientLink
              href="/store"
              className="pbn-focus rounded-lg py-3 hover:text-brand"
              data-testid="desktop-nav-store-link"
            >
              Shop all
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/#shop-by-pet"
              className="pbn-focus rounded-lg py-3 hover:text-brand"
            >
              Shop by pet
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/#best-sellers"
              className="pbn-focus rounded-lg py-3 hover:text-brand"
            >
              Best sellers
            </LocalizedClientLink>
          </div>

          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="pbn-focus rounded-lg font-display text-xl font-extrabold tracking-[-0.04em] text-ink hover:text-brand xsmall:text-2xl"
              data-testid="nav-store-link"
            >
              PetBox<span className="text-brand">Nest</span>
            </LocalizedClientLink>
          </div>

          <div className="flex h-full flex-1 basis-0 items-center justify-end gap-x-2 xsmall:gap-x-4">
            <LocalizedClientLink
              href="/about-us"
              className="pbn-focus hidden rounded-lg py-3 hover:text-brand small:block"
            >
              Our story
            </LocalizedClientLink>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="pbn-focus flex min-h-11 items-center rounded-lg px-2 hover:text-brand"
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
              className="pbn-focus flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-mist hover:text-brand"
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
