"use client"

import { Table, Text } from "@modules/common/components/ui"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"
import { notifyLayoutSessionChanged } from "@modules/layout/components/layout-session-provider"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changeQuantity = async (quantity: number) => {
    setError(null)

    if (!Number.isInteger(quantity) || quantity < 1) {
      setError("Quantity must be at least 1.")
      return
    }

    if (maxQuantity !== undefined && quantity > maxQuantity) {
      setError(
        maxQuantity > 0
          ? `Only ${maxQuantity} available.`
          : "This item is currently out of stock."
      )
      return
    }

    if (quantity === item.quantity) {
      return
    }

    setUpdating(true)

    await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .then(() => notifyLayoutSessionChanged())
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  const inventoryLimited = Boolean(
    item.variant?.manage_inventory && !item.variant.allow_backorder
  )
  const maxQuantity = inventoryLimited
    ? Math.max(0, Math.floor(item.variant?.inventory_quantity ?? 0))
    : undefined
  const quantityUnavailable = maxQuantity === 0

  if (type === "full") {
    return (
      <li
        className="grid gap-4 rounded-[22px] border border-[#E6E8EC] bg-white p-4 transition hover:border-brand/35 xsmall:grid-cols-[112px_minmax(0,1fr)] small:p-5"
        data-testid="product-row"
      >
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className="pbn-focus block w-full overflow-hidden rounded-[18px] bg-mist xsmall:w-28"
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
          />
        </LocalizedClientLink>

        <div className="grid min-w-0 gap-4 small:grid-cols-[minmax(0,1fr)_160px]">
          <div className="min-w-0">
            <LocalizedClientLink
              href={`/products/${item.product_handle}`}
              className="pbn-focus rounded-sm font-display text-xl font-bold leading-tight text-ink transition-colors hover:text-brand"
              data-testid="product-title"
            >
              {item.product_title}
            </LocalizedClientLink>
            <div className="mt-2">
              <LineItemOptions
                variant={item.variant}
                data-testid="product-variant"
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex min-h-11 items-center gap-2 rounded-[14px] bg-cream px-3">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  Qty
                </span>
                <div className="flex items-center overflow-hidden rounded-xl border border-[#E6E8EC] bg-white">
                  <button
                    type="button"
                    onClick={() =>
                      void changeQuantity(
                        Math.min(
                          item.quantity - 1,
                          maxQuantity ?? item.quantity - 1
                        )
                      )
                    }
                    disabled={updating || item.quantity <= 1}
                    className="pbn-focus grid min-h-10 min-w-10 place-items-center text-lg font-bold text-ink disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label={`Decrease quantity of ${item.product_title}`}
                  >
                    −
                  </button>
                  <input
                    key={item.quantity}
                    type="number"
                    min={1}
                    max={maxQuantity}
                    defaultValue={item.quantity}
                    disabled={updating || quantityUnavailable}
                    onBlur={(event) => {
                      const requestedQuantity = Number(event.currentTarget.value)

                      if (
                        !Number.isInteger(requestedQuantity) ||
                        requestedQuantity < 1 ||
                        (maxQuantity !== undefined &&
                          requestedQuantity > maxQuantity)
                      ) {
                        event.currentTarget.value = String(item.quantity)
                      }

                      void changeQuantity(requestedQuantity)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.currentTarget.blur()
                      }
                    }}
                    className="h-10 w-12 border-x border-y-0 border-[#E6E8EC] bg-white px-1 text-center font-bold text-ink outline-none [appearance:textfield] focus:ring-2 focus:ring-brand/40 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    data-testid="product-select-button"
                    aria-label={`Quantity of ${item.product_title}`}
                  />
                  <button
                    type="button"
                    onClick={() => void changeQuantity(item.quantity + 1)}
                    disabled={
                      updating ||
                      quantityUnavailable ||
                      (maxQuantity !== undefined &&
                        item.quantity >= maxQuantity)
                    }
                    className="pbn-focus grid min-h-10 min-w-10 place-items-center text-lg font-bold text-ink disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label={`Increase quantity of ${item.product_title}`}
                  >
                    +
                  </button>
                </div>
                {updating && <Spinner />}
              </div>
              {inventoryLimited && (
                <p className="text-xs font-semibold text-muted">
                  {maxQuantity !== undefined && maxQuantity > 0
                    ? `${maxQuantity} currently available`
                    : "Currently out of stock"}
                </p>
              )}
              <DeleteButton
                id={item.id}
                className="min-h-11 rounded-[14px] border border-[#E6E8EC] bg-white px-3 text-muted transition-colors hover:border-brand hover:text-brand"
                data-testid="product-delete-button"
              >
                Remove
              </DeleteButton>
            </div>
            <ErrorMessage error={error} data-testid="product-error-message" />
          </div>

          <div className="grid gap-3 rounded-[18px] bg-mist p-4 small:text-right">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
                Unit price
              </p>
              <div className="mt-1 font-bold text-ink">
                <LineItemUnitPrice
                  item={item}
                  style="tight"
                  currencyCode={currencyCode}
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand">
                Item total
              </p>
              <div className="mt-1 font-display text-2xl font-bold text-ink">
                <LineItemPrice
                  item={item}
                  style="tight"
                  currencyCode={currencyCode}
                />
              </div>
            </div>
          </div>
        </div>
      </li>
    )
  }

  return (
    <Table.Row
      className="w-full border-b border-[#E6E8EC] last:border-b-0"
      data-testid="product-row"
    >
      <Table.Cell className="w-20 !pl-0 py-4 pr-3">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className="pbn-focus flex w-16 overflow-hidden rounded-[14px] bg-mist"
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
          />
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className="min-w-0 py-4 text-left">
        <Text
          className="line-clamp-2 font-display text-sm font-bold leading-5 text-ink"
          data-testid="product-title"
        >
          {item.product_title}
        </Text>
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
      </Table.Cell>

      <Table.Cell className="w-24 !pr-0 py-4">
        <span className="!pr-0 flex h-full flex-col items-end justify-center">
          <span className="flex gap-x-1">
            <Text className="text-sm text-muted">{item.quantity}x </Text>
            <LineItemUnitPrice
              item={item}
              style="tight"
              currencyCode={currencyCode}
            />
          </span>
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
