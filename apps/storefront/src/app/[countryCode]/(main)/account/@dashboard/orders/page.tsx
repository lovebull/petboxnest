import { Metadata } from "next"

import OrderOverview from "@modules/account/components/order-overview"
import { notFound } from "next/navigation"
import { listOrders } from "@lib/data/orders"
import Divider from "@modules/common/components/divider"
import TransferRequestForm from "@modules/account/components/transfer-request-form"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Orders",
  description: "Overview of your previous orders.",
}

export default async function Orders() {
  const orders = await listOrders()

  if (!orders) {
    notFound()
  }

  return (
    <div className="w-full space-y-8" data-testid="orders-page-wrapper">
      <div className="rounded-[22px] bg-cream p-5 xsmall:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
          Order history
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-ink">
          Orders
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
          View your previous orders and their status. To request an eligible
          return, please{" "}
          <LocalizedClientLink
            href="/contact"
            className="pbn-focus font-bold text-brand underline underline-offset-4"
          >
            contact customer care
          </LocalizedClientLink>{" "}
          and review our{" "}
          <LocalizedClientLink
            href="/refund-policy"
            className="pbn-focus font-bold text-brand underline underline-offset-4"
          >
            Returns &amp; Refunds Policy
          </LocalizedClientLink>
          .
        </p>
      </div>
      <div className="space-y-8">
        <OrderOverview orders={orders} />
        <Divider className="mb-8 mt-8" />
        <TransferRequestForm />
      </div>
    </div>
  )
}
