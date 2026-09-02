"use client"

import { ArrowRightOnRectangle, CreditCard } from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"
import { useParams, usePathname } from "next/navigation"
import type React from "react"

import { signout } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MapPin from "@modules/common/icons/map-pin"
import Package from "@modules/common/icons/package"
import User from "@modules/common/icons/user"

const accountNavItems = [
  {
    href: "/account",
    label: "Overview",
    description: "Orders and account snapshot",
    icon: User,
    testId: "overview-link",
  },
  {
    href: "/account/profile",
    label: "Profile",
    description: "Name, email, phone, billing",
    icon: User,
    testId: "profile-link",
  },
  {
    href: "/account/addresses",
    label: "Addresses",
    description: "Saved delivery details",
    icon: MapPin,
    testId: "addresses-link",
  },
  {
    href: "/account/orders",
    label: "Orders",
    description: "History and order details",
    icon: Package,
    testId: "orders-link",
  },
  {
    href: "/account/cashback",
    label: "Cashback",
    description: "Rewards and account credit",
    icon: CreditCard,
    testId: "cashback-link",
  },
  {
    href: "/account/referrals",
    label: "Refer a friend",
    description: "Share PetBoxNest",
    icon: User,
    testId: "referrals-link",
  },
]

const AccountNav = ({
  customer,
}: {
  customer: HttpTypes.StoreCustomer | null
}) => {
  const route = usePathname()
  const { countryCode } = useParams() as { countryCode: string }

  const handleLogout = async () => {
    await signout(countryCode)
  }

  return (
    <nav
      className="rounded-[24px] border border-[#E6E8EC] bg-white p-4 shadow-[0_8px_24px_rgba(32,36,51,0.06)]"
      aria-label="Account navigation"
    >
      <div className="flex items-center gap-3 border-b border-[#E6E8EC] pb-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-mint text-brand">
          <User size={22} />
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-bold text-ink">
            Hello {customer?.first_name || "there"}
          </p>
          <p className="truncate text-sm text-muted">{customer?.email}</p>
        </div>
      </div>

      <div className="mt-4 small:hidden" data-testid="mobile-account-nav">
        <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
          {accountNavItems.map((item) => (
            <li key={item.href} className="shrink-0">
              <AccountNavLink
                href={item.href}
                route={route!}
                data-testid={item.testId}
                compact
              >
                {item.label}
              </AccountNavLink>
            </li>
          ))}
          <li className="shrink-0">
            <button
              type="button"
              className="pbn-focus inline-flex min-h-11 items-center gap-2 rounded-[14px] border border-[#E6E8EC] bg-cream px-4 text-sm font-bold text-ink transition-colors hover:border-brand hover:text-brand"
              onClick={handleLogout}
              data-testid="logout-button"
            >
              <ArrowRightOnRectangle />
              Log out
            </button>
          </li>
        </ul>
      </div>

      <div className="mt-5 hidden small:block" data-testid="account-nav">
        <p className="px-2 text-xs font-bold uppercase tracking-[0.14em] text-brand">
          Account menu
        </p>
        <ul className="mt-3 flex flex-col gap-2">
          {accountNavItems.map((item) => {
            const Icon = item.icon

            return (
              <li key={item.href}>
                <AccountNavLink
                  href={item.href}
                  route={route!}
                  data-testid={item.testId}
                  description={item.description}
                  icon={<Icon size={20} />}
                >
                  {item.label}
                </AccountNavLink>
              </li>
            )
          })}
          <li className="pt-2">
            <button
              type="button"
              className="pbn-focus flex min-h-12 w-full items-center gap-3 rounded-[14px] px-3 text-left text-sm font-bold text-muted transition-colors hover:bg-cream hover:text-brand"
              onClick={handleLogout}
              data-testid="logout-button"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-mist text-ink">
                <ArrowRightOnRectangle />
              </span>
              Log out
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}

type AccountNavLinkProps = {
  href: string
  route: string
  children: React.ReactNode
  compact?: boolean
  description?: string
  icon?: React.ReactNode
  "data-testid"?: string
}

const AccountNavLink = ({
  href,
  route,
  children,
  compact = false,
  description,
  icon,
  "data-testid": dataTestId,
}: AccountNavLinkProps) => {
  const { countryCode }: { countryCode: string } = useParams()

  const currentPath = route.split(countryCode)[1] || "/account"
  const active =
    href === "/account"
      ? currentPath === href
      : currentPath === href || currentPath.startsWith(`${href}/`)

  if (compact) {
    return (
      <LocalizedClientLink
        href={href}
        className={clx(
          "pbn-focus inline-flex min-h-11 items-center rounded-[14px] border px-4 text-sm font-bold transition-colors",
          active
            ? "border-brand bg-brand text-white"
            : "border-[#E6E8EC] bg-cream text-ink hover:border-brand hover:text-brand"
        )}
        data-testid={dataTestId}
      >
        {children}
      </LocalizedClientLink>
    )
  }

  return (
    <LocalizedClientLink
      href={href}
      className={clx(
        "pbn-focus flex min-h-14 items-center gap-3 rounded-[14px] px-3 text-sm font-bold transition-colors",
        active
          ? "bg-brand text-white"
          : "text-ink hover:bg-cream hover:text-brand"
      )}
      data-testid={dataTestId}
    >
      {icon && (
        <span
          className={clx(
            "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
            active ? "bg-white/15 text-white" : "bg-mist text-brand"
          )}
        >
          {icon}
        </span>
      )}
      <span className="min-w-0">
        <span className="block leading-5">{children}</span>
        {description && (
          <span
            className={clx(
              "mt-0.5 block text-xs font-medium leading-4",
              active ? "text-white/75" : "text-muted"
            )}
          >
            {description}
          </span>
        )}
      </span>
    </LocalizedClientLink>
  )
}

export default AccountNav
