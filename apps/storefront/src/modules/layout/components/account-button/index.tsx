"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import User from "@modules/common/icons/user"
import { useLayoutSession } from "@modules/layout/components/layout-session-provider"

export function AccountButtonFallback() {
  return (
    <LocalizedClientLink
      href="/account"
      className="pbn-focus flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-mist hover:text-brand"
      data-testid="nav-account-link"
      aria-label="Sign in to account"
    >
      <User size="18" aria-hidden="true" />
      <span className="sr-only">Sign in to account</span>
    </LocalizedClientLink>
  )
}

export default function AccountButton() {
  const { customer } = useLayoutSession()

  if (!customer) {
    return <AccountButtonFallback />
  }

  return (
    <LocalizedClientLink
      href="/account"
      className="pbn-focus flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-mist hover:text-brand"
      data-testid="nav-account-link"
      aria-label="Account"
    >
      <span>Account</span>
    </LocalizedClientLink>
  )
}
