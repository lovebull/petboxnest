"use client"

import { convertToLocale } from "@lib/util/money"
import React from "react"

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    currency_code: string
    item_subtotal?: number | null
    shipping_subtotal?: number | null
    discount_subtotal?: number | null
    credit_line_total?: number | null
  }
  variant?: "default" | "cart"
}

const CartTotals: React.FC<CartTotalsProps> = ({
  totals,
  variant = "default",
}) => {
  const {
    currency_code,
    total,
    tax_total,
    item_subtotal,
    shipping_subtotal,
    discount_subtotal,
    credit_line_total,
  } = totals

  if (variant === "cart") {
    return (
      <div className="rounded-[20px] border border-[#E6E8EC] bg-white p-4">
        <div className="flex flex-col gap-y-3 text-sm text-muted">
          <div className="flex items-center justify-between gap-4">
            <span>Subtotal (excl. shipping and taxes)</span>
            <span
              className="font-bold text-ink"
              data-testid="cart-subtotal"
              data-value={item_subtotal || 0}
            >
              {convertToLocale({ amount: item_subtotal ?? 0, currency_code })}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Shipping</span>
            <span
              className="font-bold text-ink"
              data-testid="cart-shipping"
              data-value={shipping_subtotal || 0}
            >
              {convertToLocale({
                amount: shipping_subtotal ?? 0,
                currency_code,
              })}
            </span>
          </div>
          {!!discount_subtotal && (
            <div className="flex items-center justify-between gap-4">
              <span>Discount</span>
              <span
                className="font-bold text-brand"
                data-testid="cart-discount"
                data-value={discount_subtotal || 0}
              >
                -{" "}
                {convertToLocale({
                  amount: discount_subtotal ?? 0,
                  currency_code,
                })}
              </span>
            </div>
          )}
          {!!credit_line_total && (
            <div className="flex items-center justify-between gap-4">
              <span>Store credit</span>
              <span
                className="font-bold text-brand"
                data-testid="cart-store-credit"
              >
                - {convertToLocale({ amount: credit_line_total, currency_code })}
              </span>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <span className="flex items-center gap-x-1">Taxes</span>
            <span
              className="font-bold text-ink"
              data-testid="cart-taxes"
              data-value={tax_total || 0}
            >
              {convertToLocale({ amount: tax_total ?? 0, currency_code })}
            </span>
          </div>
        </div>
        <div className="my-4 h-px w-full border-b border-[#E6E8EC]" />
        <div className="mb-1 flex items-center justify-between gap-4 text-ink">
          <span className="font-display text-xl font-bold">Total</span>
          <span
            className="font-display text-3xl font-bold"
            data-testid="cart-total"
            data-value={total || 0}
          >
            {convertToLocale({ amount: total ?? 0, currency_code })}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col gap-y-2 txt-medium text-ui-fg-subtle ">
        <div className="flex items-center justify-between">
          <span>Subtotal (excl. shipping and taxes)</span>
          <span data-testid="cart-subtotal" data-value={item_subtotal || 0}>
            {convertToLocale({ amount: item_subtotal ?? 0, currency_code })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Shipping</span>
          <span data-testid="cart-shipping" data-value={shipping_subtotal || 0}>
            {convertToLocale({ amount: shipping_subtotal ?? 0, currency_code })}
          </span>
        </div>
        {!!discount_subtotal && (
          <div className="flex items-center justify-between">
            <span>Discount</span>
            <span
              className="text-ui-fg-interactive"
              data-testid="cart-discount"
              data-value={discount_subtotal || 0}
            >
              -{" "}
              {convertToLocale({
                amount: discount_subtotal ?? 0,
                currency_code,
              })}
            </span>
          </div>
        )}
        {!!credit_line_total && (
          <div className="flex items-center justify-between">
            <span>Store credit</span>
            <span className="text-ui-fg-interactive" data-testid="cart-store-credit">
              - {convertToLocale({ amount: credit_line_total, currency_code })}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="flex gap-x-1 items-center ">Taxes</span>
          <span data-testid="cart-taxes" data-value={tax_total || 0}>
            {convertToLocale({ amount: tax_total ?? 0, currency_code })}
          </span>
        </div>
      </div>
      <div className="h-px w-full border-b border-gray-200 my-4" />
      <div className="flex items-center justify-between text-ui-fg-base mb-2 txt-medium ">
        <span>Total</span>
        <span
          className="txt-xlarge-plus"
          data-testid="cart-total"
          data-value={total || 0}
        >
          {convertToLocale({ amount: total ?? 0, currency_code })}
        </span>
      </div>
      <div className="h-px w-full border-b border-gray-200 mt-4" />
    </div>
  )
}

export default CartTotals
