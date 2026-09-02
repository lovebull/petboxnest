"use client"

import { Table, Text } from "@modules/common/components/ui"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"

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
    setUpdating(true)

    await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  // TODO: Update this to grab the actual max inventory
  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory

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
                <CartItemSelect
                  value={item.quantity}
                  onChange={(value) =>
                    changeQuantity(parseInt(value.target.value))
                  }
                  className="h-10 w-16 border-0 bg-white"
                  data-testid="product-select-button"
                >
                  {Array.from(
                    {
                      length: Math.min(maxQuantity, 10),
                    },
                    (_, i) => (
                      <option value={i + 1} key={i}>
                        {i + 1}
                      </option>
                    )
                  )}
                </CartItemSelect>
                {updating && <Spinner />}
              </div>
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
    <Table.Row className="w-full" data-testid="product-row">
      <Table.Cell className="!pl-0 p-4 w-24">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className="flex w-16"
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
          />
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className="text-left">
        <Text
          className="txt-medium-plus text-ui-fg-base"
          data-testid="product-title"
        >
          {item.product_title}
        </Text>
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
      </Table.Cell>

      <Table.Cell className="!pr-0">
        <span className="!pr-0 flex h-full flex-col items-end justify-center">
          <span className="flex gap-x-1">
            <Text className="text-ui-fg-muted">{item.quantity}x </Text>
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
