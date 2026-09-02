import { Metadata } from "next"
import { notFound } from "next/navigation"

import AddressBook from "@modules/account/components/address-book"

import { getRegion } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Addresses",
  description: "View your addresses",
}

export default async function Addresses(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const customer = await retrieveCustomer()
  const region = await getRegion(countryCode)

  if (!customer || !region) {
    notFound()
  }

  return (
    <div className="w-full space-y-8" data-testid="addresses-page-wrapper">
      <div className="rounded-[22px] bg-cream p-5 xsmall:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
          Saved delivery spots
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-ink">
          Shipping Addresses
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
          View and update your shipping addresses, you can add as many as you
          like. Saving your addresses will make them available during checkout.
        </p>
      </div>
      <AddressBook customer={customer} region={region} />
    </div>
  )
}
