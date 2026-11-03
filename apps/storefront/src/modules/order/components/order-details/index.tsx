import { HttpTypes } from "@medusajs/types"
import { Text } from "@modules/common/components/ui"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  const formatStatus = (str: string) => {
    const formatted = str.split("_").join(" ")

    return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
  }

  return (
    <div className="grid gap-4 small:grid-cols-3">
      <div className="rounded-[16px] bg-mist p-4">
        <Text className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
          Confirmation email
        </Text>
        <Text className="mt-2 break-words font-semibold text-ink" data-testid="order-email">
          {order.email}
        </Text>
      </div>
      <div className="rounded-[16px] bg-mist p-4">
        <Text className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
          Order date
        </Text>
        <Text className="mt-2 font-semibold text-ink" data-testid="order-date">
          {new Date(order.created_at).toDateString()}
        </Text>
      </div>
      <div className="rounded-[16px] bg-mist p-4">
        <Text className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
          Order number
        </Text>
        <Text className="mt-2 font-semibold text-brand" data-testid="order-id">
          {order.display_id}
        </Text>
      </div>
      <div className="col-span-full text-sm leading-6 text-muted">
        We have sent the order confirmation details to{" "}
        <span className="font-semibold text-ink">{order.email}</span>.
      </div>
      <div className="col-span-full flex flex-wrap items-center gap-3 text-sm">
        {showStatus && (
          <>
            <Text className="rounded-full bg-cream px-3 py-1.5 text-muted">
              Order status: <span className="font-semibold text-ink" data-testid="order-status">
                {formatStatus(order.fulfillment_status)}
              </span>
            </Text>
            <Text className="rounded-full bg-cream px-3 py-1.5 text-muted">
              Payment status: <span className="font-semibold text-ink" data-testid="order-payment-status">
                {formatStatus(order.payment_status)}
              </span>
            </Text>
          </>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
