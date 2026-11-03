import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@modules/common/components/ui"


type ShippingDetailsProps = {
  order: HttpTypes.StoreOrder
}

const ShippingDetails = ({ order }: ShippingDetailsProps) => {
  return (
    <section className="rounded-[24px] border border-[#E6E8EC] bg-white p-5 shadow-[0_8px_24px_rgba(32,36,51,0.05)] small:rounded-[28px] small:p-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Next stop</p>
          <Heading level="h2" className="mt-2 font-display text-2xl font-bold text-ink">Delivery</Heading>
        </div>
        <span className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-ink">Address saved</span>
      </div>
      <div className="grid gap-5 small:grid-cols-3 small:gap-6">
        <div
          className="flex flex-col"
          data-testid="shipping-address-summary"
        >
          <Text className="text-xs font-bold uppercase tracking-[0.12em] text-muted mb-2">
            Shipping Address
          </Text>
          <Text className="text-sm font-semibold text-ink">
            {order.shipping_address?.first_name}{" "}
            {order.shipping_address?.last_name}
          </Text>
          <Text className="text-sm leading-6 text-muted">
            {order.shipping_address?.address_1}{" "}
            {order.shipping_address?.address_2}
          </Text>
          <Text className="text-sm leading-6 text-muted">
            {order.shipping_address?.postal_code},{" "}
            {order.shipping_address?.city}
          </Text>
          <Text className="text-sm leading-6 text-muted">
            {order.shipping_address?.country_code?.toUpperCase()}
          </Text>
        </div>

        <div
          className="flex flex-col"
          data-testid="shipping-contact-summary"
        >
          <Text className="text-xs font-bold uppercase tracking-[0.12em] text-muted mb-2">Contact</Text>
          <Text className="break-words text-sm font-semibold text-ink">
            {order.shipping_address?.phone}
          </Text>
          <Text className="break-words text-sm leading-6 text-muted">{order.email}</Text>
        </div>

        <div
          className="flex flex-col"
          data-testid="shipping-method-summary"
        >
          <Text className="text-xs font-bold uppercase tracking-[0.12em] text-muted mb-2">Method</Text>
          <Text className="text-sm font-semibold text-ink">
            {(order.shipping_methods?.[0] as { name?: string })?.name} (
            {convertToLocale({
              amount: order.shipping_methods?.[0]?.total ?? 0,
              currency_code: order.currency_code,
            })}
            )
          </Text>
        </div>
      </div>
    </section>
  )
}

export default ShippingDetails
