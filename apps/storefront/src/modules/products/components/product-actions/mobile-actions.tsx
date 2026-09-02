import { Dialog, Transition } from "@headlessui/react"
import { Button, clx } from "@modules/common/components/ui"
import React, { Fragment, useMemo } from "react"

import useToggleState from "@lib/hooks/use-toggle-state"
import ChevronDown from "@modules/common/icons/chevron-down"
import X from "@modules/common/icons/x"

import { getProductPrice } from "@lib/util/get-product-price"
import OptionSelect from "./option-select"
import { HttpTypes } from "@medusajs/types"
import { isSimpleProduct } from "@lib/util/product"

type MobileActionsProps = {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  options: Record<string, string | undefined>
  updateOptions: (title: string, value: string) => void
  inStock?: boolean
  handleAddToCart: () => void
  isAdding?: boolean
  show: boolean
  optionsDisabled: boolean
}

const MobileActions: React.FC<MobileActionsProps> = ({
  product,
  variant,
  options,
  updateOptions,
  inStock,
  handleAddToCart,
  isAdding,
  show,
  optionsDisabled,
}) => {
  const { state, open, close } = useToggleState()

  const price = getProductPrice({
    product: product,
    variantId: variant?.id,
  })

  const selectedPrice = useMemo(() => {
    if (!price) {
      return null
    }
    const { variantPrice, cheapestPrice } = price

    return variantPrice || cheapestPrice || null
  }, [price])

  const isSimple = isSimpleProduct(product)
  const amazonUrl =
    typeof product.metadata?.amazon_url === "string"
      ? product.metadata.amazon_url.trim()
      : ""

  return (
    <>
      <div
        className={clx("small:hidden inset-x-0 bottom-0 fixed z-50", {
          "pointer-events-none": !show,
        })}
      >
        <Transition
          as={Fragment}
          show={show}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="flex w-full flex-col gap-3 border-t border-grey-20 bg-white/95 px-4 pt-3 shadow-[0_-12px_30px_rgba(32,36,51,0.10)] backdrop-blur-md pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
            data-testid="mobile-actions"
          >
            <div className="flex w-full items-center justify-between gap-4">
              <span
                className="min-w-0 truncate text-sm font-bold text-ink"
                data-testid="mobile-title"
              >
                {product.title}
              </span>
              {selectedPrice ? (
                <div className="flex shrink-0 items-end gap-x-2 text-ink">
                  {selectedPrice.price_type === "sale" && (
                    <p>
                      <span className="text-xs text-muted line-through">
                        {selectedPrice.original_price}
                      </span>
                    </p>
                  )}
                  <span
                    className={clx("font-display text-lg font-bold", {
                      "text-brand-dark": selectedPrice.price_type === "sale",
                    })}
                  >
                    {selectedPrice.calculated_price}
                  </span>
                </div>
              ) : (
                <div></div>
              )}
            </div>
            <div
              className={clx("grid w-full grid-cols-2 gap-3", {
                "!grid-cols-1": isSimple,
              })}
            >
              {!isSimple && (
                <Button
                  onClick={open}
                  variant="secondary"
                  className="pbn-secondary-button w-full px-4"
                  data-testid="mobile-actions-button"
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="truncate">
                      {variant
                        ? Object.values(options).join(" / ")
                        : "Select options"}
                    </span>
                    <ChevronDown />
                  </div>
                </Button>
              )}
              <Button
                onClick={handleAddToCart}
                disabled={!inStock || !variant}
                className="pbn-primary-button w-full px-4"
                isLoading={isAdding}
                data-testid="mobile-cart-button"
              >
                {!variant
                  ? "Select variant"
                  : !inStock
                  ? "Out of stock"
                  : "Add to cart"}
              </Button>
            </div>
            {amazonUrl && (
              <a
                href={amazonUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full"
              >
                <Button className="pbn-secondary-button w-full">
                  Also available on Amazon
                </Button>
              </a>
            )}
          </div>
        </Transition>
      </div>
      <Transition appear show={state} as={Fragment}>
        <Dialog as="div" className="relative z-[75]" onClose={close}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-700 bg-opacity-75 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-x-0 bottom-0">
            <div className="flex min-h-full h-full items-center justify-center text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Panel
                  className="flex w-full transform flex-col gap-y-3 overflow-hidden text-left"
                  data-testid="mobile-actions-modal"
                >
                  <div className="flex w-full justify-end pr-4">
                    <button
                      type="button"
                      onClick={close}
                      className="pbn-focus flex h-12 w-12 items-center justify-center rounded-circle bg-white text-ink shadow-elevation-card-rest"
                      aria-label="Close product options"
                      data-testid="close-modal-button"
                    >
                      <X />
                    </button>
                  </div>
                  <div className="rounded-t-[24px] bg-white px-5 pt-7 pb-[calc(2rem+env(safe-area-inset-bottom))]">
                    <Dialog.Title className="font-display text-2xl font-bold text-ink">
                      Choose your options
                    </Dialog.Title>
                    {(product.variants?.length ?? 0) > 1 && (
                      <div className="mt-6 flex flex-col gap-y-6">
                        {(product.options || []).map((option) => {
                          return (
                            <div key={option.id}>
                              <OptionSelect
                                option={option}
                                current={options[option.id]}
                                updateOption={updateOptions}
                                title={option.title ?? ""}
                                disabled={optionsDisabled}
                              />
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default MobileActions
