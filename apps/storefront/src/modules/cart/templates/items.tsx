import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"

import Item from "@modules/cart/components/item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items
  return (
    <section className="rounded-[24px] border border-[#E6E8EC] bg-white p-5 shadow-[0_8px_24px_rgba(32,36,51,0.06)] xsmall:p-6">
      <div className="flex flex-col gap-3 border-b border-[#E6E8EC] pb-5 xsmall:flex-row xsmall:items-end xsmall:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
            Review your picks
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight text-ink">
            Your cart
          </h2>
        </div>
        <p className="rounded-full bg-cream px-4 py-2 text-sm font-bold text-muted">
          {items?.length || 0} {items?.length === 1 ? "item" : "items"}
        </p>
      </div>
      <ul className="mt-5 space-y-4" data-testid="items-table">
        {items
          ? items
              .sort((a, b) => {
                return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
              })
              .map((item) => {
                return (
                  <Item
                    key={item.id}
                    item={item}
                    currencyCode={cart?.currency_code}
                  />
                )
              })
          : repeat(3).map((i) => {
              return (
                <li
                  key={i}
                  className="h-32 animate-pulse rounded-[20px] bg-mist"
                />
              )
            })}
      </ul>
    </section>
  )
}

export default ItemsTemplate
