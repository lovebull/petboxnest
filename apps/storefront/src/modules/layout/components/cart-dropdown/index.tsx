"use client"

import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react"
import { ArrowRight, CheckCircleSolid, ShoppingBag, XMark } from "@medusajs/icons"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@modules/common/components/ui"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { usePathname } from "next/navigation"
import { Fragment, useEffect, useRef, useState } from "react"

const CartDropdown = ({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) => {
  const [activeTimer, setActiveTimer] = useState<NodeJS.Timer | undefined>(
    undefined
  )
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const open = () => setCartDropdownOpen(true)
  const close = () => setCartDropdownOpen(false)

  const totalItems =
    cartState?.items?.reduce((acc, item) => {
      return acc + item.quantity
    }, 0) || 0

  const subtotal = cartState?.subtotal ?? 0
  const itemRef = useRef<number>(totalItems || 0)

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const closeWithDelay = () => {
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => {
      close()
      closeTimerRef.current = null
    }, 180)
  }

  const timedOpen = () => {
    clearCloseTimer()
    open()

    const timer = setTimeout(close, 5000)

    setActiveTimer(timer)
  }

  const openAndCancel = () => {
    clearCloseTimer()

    if (activeTimer) {
      clearTimeout(activeTimer)
    }

    open()
  }

  // Clean up the timer when the component unmounts
  useEffect(() => {
    return () => {
      if (activeTimer) {
        clearTimeout(activeTimer)
      }

      clearCloseTimer()
    }
  }, [activeTimer])

  const pathname = usePathname()

  // open cart dropdown when modifying the cart items, but only if we're not on the cart page
  useEffect(() => {
    if (itemRef.current !== totalItems && !pathname.includes("/cart")) {
      timedOpen()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems, itemRef.current])

  return (
    <div
      className="z-50 flex h-full items-center"
      onMouseEnter={openAndCancel}
      onMouseLeave={closeWithDelay}
    >
      <Popover className="relative flex h-full items-center">
        <PopoverButton
          className="pbn-focus relative flex min-h-11 min-w-11 items-center justify-center rounded-lg px-2 hover:bg-mist hover:text-brand"
          data-testid="nav-cart-link"
          aria-label={`Shopping cart with ${totalItems} items`}
          onClick={openAndCancel}
        >
          <ShoppingBag className="small:hidden" aria-hidden="true" />
          <span
            className="hidden small:inline"
            aria-live="polite"
          >{`Cart (${totalItems})`}</span>
          {totalItems > 0 && (
            <span
              className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-white small:hidden"
              aria-live="polite"
            >
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          )}
        </PopoverButton>
        <Transition
          show={cartDropdownOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <PopoverPanel
            static
            className="fixed left-4 right-4 top-[96px] z-50 max-h-[calc(100vh-112px)] overflow-hidden rounded-[24px] border border-[#E6E8EC] bg-white text-ink shadow-[0_24px_60px_rgba(32,36,51,0.18)] small:absolute small:left-auto small:right-0 small:top-[calc(100%+12px)] small:w-[440px]"
            data-testid="nav-cart-dropdown"
            role="dialog"
            aria-label="Shopping cart preview"
            onMouseEnter={openAndCancel}
          >
            <div className="flex items-start justify-between gap-4 bg-cream p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
                  Mini cart
                </p>
                <h3 className="mt-1 font-display text-2xl font-bold leading-tight">
                  Cart ({totalItems})
                </h3>
                <p className="mt-1 text-sm leading-5 text-muted">
                  A quick check before the full review.
                </p>
              </div>
              <button
                type="button"
                className="pbn-focus grid min-h-11 min-w-11 place-items-center rounded-[14px] bg-white text-ink transition hover:text-brand"
                onClick={close}
                aria-label="Close cart preview"
              >
                <XMark />
              </button>
            </div>
            {cartState && cartState.items?.length ? (
              <>
                <div className="grid max-h-[min(430px,calc(100vh-360px))] grid-cols-1 gap-3 overflow-y-auto p-4 no-scrollbar">
                  {cartState.items
                    .sort((a, b) => {
                      return (a.created_at ?? "") > (b.created_at ?? "")
                        ? -1
                        : 1
                    })
                    .map((item) => (
                      <div
                        className="grid grid-cols-[86px_minmax(0,1fr)] gap-4 rounded-[20px] border border-[#E6E8EC] bg-white p-3 shadow-[0_8px_24px_rgba(32,36,51,0.04)]"
                        key={item.id}
                        data-testid="cart-item"
                      >
                        <LocalizedClientLink
                          href={`/products/${item.product_handle}`}
                          className="pbn-focus block overflow-hidden rounded-[16px] bg-mist"
                          onClick={close}
                        >
                          <Thumbnail
                            thumbnail={item.thumbnail}
                            images={item.variant?.product?.images}
                            size="square"
                          />
                        </LocalizedClientLink>
                        <div className="flex min-w-0 flex-col justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="min-w-0 font-display text-base font-bold leading-5 text-ink">
                                <LocalizedClientLink
                                  href={`/products/${item.product_handle}`}
                                  data-testid="product-link"
                                  className="pbn-focus block max-h-10 overflow-hidden rounded-sm hover:text-brand"
                                  onClick={close}
                                >
                                  {item.title}
                                </LocalizedClientLink>
                              </h3>
                              <div className="shrink-0 text-right text-sm font-bold text-ink">
                                <LineItemPrice
                                  item={item}
                                  style="tight"
                                  currencyCode={cartState.currency_code}
                                />
                              </div>
                            </div>
                            <div className="mt-2 text-sm leading-5 text-muted">
                              <LineItemOptions
                                variant={item.variant}
                                data-testid="cart-item-variant"
                                data-value={item.variant}
                              />
                              <span
                                className="mt-1 inline-flex rounded-full bg-cream px-3 py-1 text-xs font-bold text-ink"
                                data-testid="cart-item-quantity"
                                data-value={item.quantity}
                              >
                                Quantity: {item.quantity}
                              </span>
                            </div>
                          </div>
                          <DeleteButton
                            id={item.id}
                            className="w-fit rounded-[14px] bg-cream px-3 text-muted transition hover:text-brand"
                            data-testid="cart-item-remove-button"
                          >
                            Remove
                          </DeleteButton>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="border-t border-[#E6E8EC] bg-white p-4">
                  <div className="flex items-center justify-between rounded-[18px] bg-cream px-4 py-3 text-sm">
                    <span className="font-bold text-ink">
                      Subtotal{" "}
                      <span className="font-medium text-muted">(excl. taxes)</span>
                    </span>
                    <span
                      className="font-display text-2xl font-bold text-ink"
                      data-testid="cart-subtotal"
                      data-value={subtotal}
                    >
                      {convertToLocale({
                        amount: subtotal,
                        currency_code: cartState.currency_code,
                      })}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2">
                    <div className="flex items-center gap-2 rounded-[14px] bg-mist px-3 py-2 text-xs font-bold text-muted">
                      <CheckCircleSolid className="text-brand" />
                      Variant details and quantity stay visible before checkout.
                    </div>
                    <LocalizedClientLink href="/cart" passHref onClick={close}>
                      <Button
                        className="pbn-primary-button min-h-12 w-full gap-2"
                        size="large"
                        data-testid="go-to-cart-button"
                      >
                        Go to cart
                        <ArrowRight />
                      </Button>
                    </LocalizedClientLink>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-5">
                <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[22px] bg-cream p-6 text-center">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-brand">
                    <ShoppingBag />
                  </span>
                  <h3 className="mt-5 font-display text-2xl font-bold text-ink">
                    Your shopping bag is empty.
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-muted">
                    Start with a cozy upgrade, then come back here for a quick
                    review.
                  </p>
                  <LocalizedClientLink href="/store" className="mt-5 block w-full" onClick={close}>
                    <Button
                      className="pbn-primary-button w-full"
                      size="large"
                    >
                      Explore products
                    </Button>
                  </LocalizedClientLink>
                </div>
              </div>
            )}
          </PopoverPanel>
        </Transition>
      </Popover>
    </div>
  )
}

export default CartDropdown
