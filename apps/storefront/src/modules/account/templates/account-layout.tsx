import React from "react"

import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  const firstName = customer?.first_name || "friend"
  const addressCount = customer?.addresses?.length || 0

  return (
    <div
      className="flex-1 overflow-x-clip bg-cream text-ink"
      data-testid="account-page"
    >
      <div className="pbn-container py-8 xsmall:py-10 small:py-14">
        <section className="relative overflow-hidden rounded-[28px] bg-brand px-5 py-8 text-white shadow-[0_16px_40px_rgba(32,36,51,0.12)] xsmall:px-7 small:rounded-[32px] small:px-10 small:py-12">
          <div className="relative z-10 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-yellow">
              PetBoxNest account
            </p>
            <h1 className="mt-3 font-display text-[34px] font-bold leading-[1.05] xsmall:text-[42px] small:text-[54px]">
              {customer
                ? `Welcome back, ${firstName}.`
                : "Welcome back to your pet home base."}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/85 xsmall:text-lg">
              {customer
                ? "Manage orders, saved addresses, and profile details from one calmer corner of the house."
                : "Sign in to manage orders, addresses, and the little details that make repeat shopping easier."}
            </p>
          </div>
          <div className="relative z-10 mt-6 flex flex-wrap gap-3 text-sm font-bold">
            <span className="rounded-full bg-white/15 px-4 py-2">
              Secure account access
            </span>
            <span className="rounded-full bg-white/15 px-4 py-2">
              Faster checkout
            </span>
            {customer && (
              <span className="rounded-full bg-white/15 px-4 py-2">
                {addressCount} saved{" "}
                {addressCount === 1 ? "address" : "addresses"}
              </span>
            )}
          </div>
        </section>

        <div
          className={
            customer
              ? "mt-6 grid min-w-0 gap-6 small:mt-8 small:grid-cols-[280px_minmax(0,1fr)] small:items-start medium:grid-cols-[300px_minmax(0,1fr)]"
              : "mx-auto mt-6 max-w-5xl small:mt-8"
          }
        >
          {customer && (
            <aside className="min-w-0 small:sticky small:top-24">
              <AccountNav customer={customer} />
            </aside>
          )}
          <section className="min-w-0 rounded-[24px] border border-[#E6E8EC] bg-white p-5 shadow-[0_8px_24px_rgba(32,36,51,0.06)] xsmall:p-6 small:rounded-[28px] small:p-8">
            {children}
          </section>
        </div>

        <section className="mt-6 grid gap-6 rounded-[24px] border border-[#E6E8EC] bg-white p-6 xsmall:p-8 small:mt-8 small:grid-cols-[1fr_auto] small:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
              Need a hand?
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-ink">
              Got questions?
            </h2>
            <p className="mt-2 max-w-2xl text-base leading-7 text-muted">
              You can find frequently asked questions and answers on our
              customer service page.
            </p>
          </div>
          <LocalizedClientLink
            href="/faq"
            className="pbn-secondary-button w-full small:w-auto"
          >
            Customer Service
          </LocalizedClientLink>
        </section>
      </div>
    </div>
  )
}

export default AccountLayout
