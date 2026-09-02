import ChevronDown from "@modules/common/icons/chevron-down"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import MapPin from "@modules/common/icons/map-pin"
import Package from "@modules/common/icons/package"
import User from "@modules/common/icons/user"
import type React from "react"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
}

const Overview = ({ customer, orders }: OverviewProps) => {
  const profileCompletion = getProfileCompletion(customer)
  const addressCount = customer?.addresses?.length || 0
  const recentOrders = orders?.slice(0, 5) || []

  return (
    <div className="space-y-8" data-testid="overview-page-wrapper">
      <div className="grid gap-5 small:grid-cols-[minmax(0,1fr)_auto] small:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
            Account overview
          </p>
          <h2
            className="mt-2 font-display text-3xl font-bold leading-tight text-ink"
            data-testid="welcome-message"
            data-value={customer?.first_name}
          >
            Hello {customer?.first_name || "there"}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
            Your orders, saved addresses, and profile details live here for a
            smoother PetBoxNest checkout.
          </p>
        </div>
        <div className="rounded-[18px] bg-cream px-4 py-3 text-sm text-muted small:text-right">
          <span>Signed in as </span>
          <span
            className="font-bold text-ink"
            data-testid="customer-email"
            data-value={customer?.email}
          >
            {customer?.email}
          </span>
        </div>
      </div>

      <div className="grid gap-4 xsmall:grid-cols-2 small:grid-cols-3">
        <StatCard
          icon={<User size={22} />}
          label="Profile"
          value={`${profileCompletion}%`}
          caption="Completed"
          href="/account/profile"
          testId="customer-profile-completion"
          testValue={profileCompletion}
        />
        <StatCard
          icon={<MapPin size={22} />}
          label="Addresses"
          value={addressCount}
          caption="Saved"
          href="/account/addresses"
          testId="addresses-count"
          testValue={addressCount}
        />
        <StatCard
          icon={<Package size={22} />}
          label="Recent orders"
          value={recentOrders.length}
          caption="On this account"
          href="/account/orders"
        />
      </div>

      <section className="rounded-[22px] border border-[#E6E8EC] bg-mist p-5 xsmall:p-6">
        <div className="flex flex-col gap-4 xsmall:flex-row xsmall:items-end xsmall:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
              Recent orders
            </p>
            <h3 className="mt-2 font-display text-2xl font-bold text-ink">
              Nest notes from checkout
            </h3>
          </div>
          <LocalizedClientLink
            href="/account/orders"
            className="pbn-focus inline-flex min-h-11 w-full items-center justify-center rounded-[14px] bg-white px-4 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:text-brand motion-reduce:transition-none xsmall:w-auto"
          >
            View all orders
          </LocalizedClientLink>
        </div>

        <ul className="mt-5 space-y-3" data-testid="orders-wrapper">
          {recentOrders.length > 0 ? (
            recentOrders.map((order) => {
              return (
                <li
                  key={order.id}
                  data-testid="order-wrapper"
                  data-value={order.id}
                >
                  <LocalizedClientLink
                    href={`/account/orders/details/${order.id}`}
                    className="pbn-focus group grid gap-4 rounded-[18px] border border-[#E6E8EC] bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand/40 motion-reduce:transition-none small:grid-cols-[minmax(0,1fr)_auto] small:items-center"
                  >
                    <div className="grid gap-3 text-sm xsmall:grid-cols-3">
                      <OrderMeta
                        label="Date placed"
                        testId="order-created-date"
                        value={new Date(order.created_at).toDateString()}
                      />
                      <OrderMeta
                        label="Order number"
                        testId="order-id"
                        value={`#${order.display_id}`}
                        dataValue={order.display_id}
                      />
                      <OrderMeta
                        label="Total amount"
                        testId="order-amount"
                        value={convertToLocale({
                          amount: order.total,
                          currency_code: order.currency_code,
                        })}
                      />
                    </div>
                    <span
                      className="inline-flex min-h-10 items-center justify-between gap-3 rounded-[14px] bg-cream px-4 text-sm font-bold text-brand small:justify-center"
                      data-testid="open-order-button"
                    >
                      Details
                      <ChevronDown className="-rotate-90 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </LocalizedClientLink>
                </li>
              )
            })
          ) : (
            <li
              className="rounded-[18px] border border-dashed border-brand/30 bg-white p-6 text-center"
              data-testid="no-orders-message"
            >
              <p className="font-display text-xl font-bold text-ink">
                No recent orders
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                When your pet finds a new favorite, order updates will appear
                here.
              </p>
              <LocalizedClientLink
                href="/"
                className="pbn-primary-button mt-5 w-full xsmall:w-auto"
              >
                Continue shopping
              </LocalizedClientLink>
            </li>
          )}
        </ul>
      </section>

      <section className="grid gap-4 small:grid-cols-2">
        <QuickAction
          href="/account/profile"
          title="Keep profile details tidy"
          copy="Update name, email, phone, and billing details before checkout day."
        />
        <QuickAction
          href="/account/addresses"
          title="Save the delivery spots"
          copy="Add home, work, or gift addresses for faster repeat orders."
        />
      </section>
    </div>
  )
}

const StatCard = ({
  icon,
  label,
  value,
  caption,
  href,
  testId,
  testValue,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  caption: string
  href: string
  testId?: string
  testValue?: string | number
}) => {
  return (
    <LocalizedClientLink
      href={href}
      className="pbn-focus group flex min-h-[150px] flex-col justify-between rounded-[20px] border border-[#E6E8EC] bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand/40 motion-reduce:transition-none"
    >
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mint text-brand">
        {icon}
      </span>
      <span>
        <span className="block text-sm font-bold text-muted">{label}</span>
        <span
          className="mt-1 block font-display text-4xl font-bold leading-none text-ink"
          data-testid={testId}
          data-value={testValue}
        >
          {value}
        </span>
        <span className="mt-1 block text-xs font-bold uppercase tracking-[0.12em] text-brand">
          {caption}
        </span>
      </span>
    </LocalizedClientLink>
  )
}

const OrderMeta = ({
  label,
  value,
  testId,
  dataValue,
}: {
  label: string
  value: string
  testId: string
  dataValue?: string | number
}) => {
  return (
    <span>
      <span className="block text-xs font-bold uppercase tracking-[0.12em] text-muted">
        {label}
      </span>
      <span
        className="mt-1 block font-bold text-ink"
        data-testid={testId}
        data-value={dataValue}
      >
        {value}
      </span>
    </span>
  )
}

const QuickAction = ({
  href,
  title,
  copy,
}: {
  href: string
  title: string
  copy: string
}) => {
  return (
    <LocalizedClientLink
      href={href}
      className="pbn-focus rounded-[20px] border border-[#E6E8EC] bg-cream p-5 transition hover:-translate-y-0.5 hover:border-brand/40 motion-reduce:transition-none"
    >
      <span className="font-display text-xl font-bold text-ink">{title}</span>
      <span className="mt-2 block text-sm leading-6 text-muted">{copy}</span>
      <span className="mt-4 inline-flex min-h-10 items-center rounded-[14px] bg-white px-4 text-sm font-bold text-brand">
        Manage
      </span>
    </LocalizedClientLink>
  )
}

const getProfileCompletion = (customer: HttpTypes.StoreCustomer | null) => {
  let count = 0

  if (!customer) {
    return 0
  }

  if (customer.email) {
    count++
  }

  if (customer.first_name && customer.last_name) {
    count++
  }

  if (customer.phone) {
    count++
  }

  const billingAddress = customer.addresses?.find(
    (addr) => addr.is_default_billing
  )

  if (billingAddress) {
    count++
  }

  return (count / 4) * 100
}

export default Overview
