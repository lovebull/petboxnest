import type { AfterSalesOrder } from "@lib/data/after-sales"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

function trackingUrl(value?: string | null) {
  try {
    const url = new URL(value || "")
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null
  } catch {
    return null
  }
}

export default function GuestOrderTracking({ order, onReset }: {
  order: AfterSalesOrder
  onReset: () => void
}) {
  const labels = (order.fulfillments || [])
    .filter((shipment) => !shipment.canceled_at)
    .flatMap((shipment) => shipment.labels || [])
    .filter((label) => label.tracking_number || trackingUrl(label.tracking_url))

  return (
    <section aria-labelledby="tracked-order-heading" className="space-y-6">
      <h2 id="tracked-order-heading" className="font-display text-2xl font-bold text-ink">
        Order #{order.display_id || order.id}
      </h2>
      <dl className="grid gap-4 rounded-2xl bg-mist p-5 xsmall:grid-cols-2">
        <div><dt className="text-sm text-muted">Order status</dt><dd className="mt-1 font-bold capitalize text-ink">{order.status?.replaceAll("_", " ") || "Not available"}</dd></div>
        <div><dt className="text-sm text-muted">Delivery status</dt><dd className="mt-1 font-bold capitalize text-ink">{order.fulfillment_status?.replaceAll("_", " ") || "Not available"}</dd></div>
      </dl>
      <div>
        <h3 className="font-display text-xl font-bold text-ink">Shipment tracking</h3>
        {labels.length ? <ul className="mt-4 space-y-3">{labels.map((label, index) => {
          const href = trackingUrl(label.tracking_url)
          return <li key={label.id || index} className="rounded-2xl border border-grey-20 p-4">
            <p className="text-sm text-muted">Shipment {index + 1}</p>
            {label.tracking_number && <p className="mt-2 break-all font-bold text-ink">{label.tracking_number}</p>}
            {href ? <a href={href} target="_blank" rel="noopener noreferrer" className="pbn-focus mt-3 inline-flex min-h-11 items-center rounded-lg font-bold text-brand underline underline-offset-4">Track with carrier<span className="sr-only"> (opens in a new tab)</span></a> : <p className="mt-2 text-sm text-muted">Use this number on your carrier&apos;s tracking website.</p>}
          </li>
        })}</ul> : <p className="mt-3 text-sm leading-6 text-muted">No tracking details are available yet. We will email tracking information when your shipment is arranged. If your order was canceled, no new tracking details will be issued.</p>}
      </div>
      <div>
        <h3 className="font-display text-xl font-bold text-ink">Items in your order</h3>
        <ul className="mt-3 space-y-2">{order.items?.map((item) => <li key={item.id} className="flex items-start justify-between gap-4 rounded-xl bg-mist p-4 text-sm"><span className="font-semibold text-ink">{item.title || "Item"}</span><span className="shrink-0 text-muted">Qty: {item.quantity}</span></li>)}</ul>
      </div>
      <div className="flex flex-wrap gap-4 border-t border-grey-20 pt-5">
        <button type="button" onClick={onReset} className="pbn-focus min-h-11 rounded-xl border border-grey-20 px-4 font-bold text-ink">Look up another order</button>
        <LocalizedClientLink href="/account/orders" className="pbn-focus inline-flex min-h-11 items-center rounded-lg font-bold text-brand underline underline-offset-4">My account orders</LocalizedClientLink>
        <LocalizedClientLink href="/contact" className="pbn-focus inline-flex min-h-11 items-center rounded-lg font-bold text-brand underline underline-offset-4">Get help</LocalizedClientLink>
      </div>
    </section>
  )
}
