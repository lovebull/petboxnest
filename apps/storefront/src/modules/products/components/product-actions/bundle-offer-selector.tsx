import type { StoreBundleOffer } from "@lib/data/bundle-offers"
import { convertToLocale } from "@lib/util/money"
import { getProductPrice } from "@lib/util/get-product-price"
import type { HttpTypes } from "@medusajs/types"
import { CheckCircleSolid, Gift } from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"

type BundleOfferSelectorProps = {
  offer: StoreBundleOffer
  product: HttpTypes.StoreProduct
  selectedVariantId?: string
  onSelect: (variantId: string) => void
  disabled?: boolean
  compact?: boolean
}

export default function BundleOfferSelector({
  offer,
  product,
  selectedVariantId,
  onSelect,
  disabled,
  compact,
}: BundleOfferSelectorProps) {
  return (
    <fieldset className="min-w-0" aria-label={offer.title}>
      <legend className="w-full">
        <span className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-dark">
          <span className="h-px flex-1 bg-brand/30" aria-hidden="true" />
          {offer.title}
          <span className="h-px flex-1 bg-brand/30" aria-hidden="true" />
        </span>
        {offer.subtitle && !compact && (
          <span className="mt-2 block text-center text-sm leading-5 text-muted">
            {offer.subtitle}
          </span>
        )}
      </legend>

      <div className={clx("mt-4 grid gap-3", compact && "mt-3 gap-2")}>
        {offer.options.map((option) => {
          const selected = selectedVariantId === option.variant_id
          const variant = product.variants?.find(
            (item) => item.id === option.variant_id
          )
          const price = getProductPrice({
            product,
            variantId: option.variant_id,
          }).variantPrice
          const compareAt = price?.currency_code
            ? option.compare_at_prices?.[price.currency_code.toLowerCase()]
            : undefined
          const componentSummary = option.components
            .filter((component) => component.label)
            .map(
              (component) =>
                `${component.required_quantity}× ${component.label}`
            )
            .join(" · ")

          return (
            <button
              className={clx(
                "pbn-focus group relative flex min-h-[78px] w-full items-center gap-3 rounded-[16px] border bg-mist px-4 py-3 text-left transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-brand/60",
                selected
                  ? "border-2 border-brand bg-white shadow-[0_8px_20px_rgba(101,87,217,0.12)]"
                  : "border-grey-20",
                compact && "min-h-[68px] rounded-[14px] px-3 py-2.5"
              )}
              disabled={disabled || !variant}
              key={option.id}
              onClick={() => onSelect(option.variant_id)}
              role="radio"
              aria-checked={selected}
              type="button"
            >
              {option.badge && (
                <span className="absolute -right-1 -top-2 rounded-circle bg-coral px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  {option.badge}
                </span>
              )}
              <span
                className={clx(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-circle border bg-white text-brand",
                  selected ? "border-brand" : "border-grey-20 text-grey-40"
                )}
                aria-hidden="true"
              >
                {selected ? <CheckCircleSolid /> : <span className="h-2.5 w-2.5 rounded-circle bg-current" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-base font-bold leading-5 text-ink">
                  {option.title}
                </span>
                {(option.subtitle || componentSummary) && (
                  <span className="mt-0.5 block text-xs leading-4 text-muted">
                    {option.subtitle || componentSummary}
                  </span>
                )}
                {option.gift_label && (
                  <span className="mt-1 flex items-center gap-1 text-xs font-bold text-brand-dark">
                    <Gift aria-hidden="true" />
                    {option.gift_label}
                  </span>
                )}
              </span>
              <span className="shrink-0 text-right">
                <span className="block font-display text-base font-bold text-ink">
                  {price?.calculated_price || "—"}
                </span>
                {typeof compareAt === "number" && compareAt > 0 && (
                  <span className="block text-xs text-muted line-through">
                    {convertToLocale({
                      amount: compareAt,
                      currency_code: price?.currency_code || "usd",
                    })}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
