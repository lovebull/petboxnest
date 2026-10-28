"use client"

import { retrieveLayoutSession } from "@lib/data/layout-session"
import { HttpTypes, StoreCartShippingOption } from "@medusajs/types"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { usePathname } from "next/navigation"

type LayoutSession = {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  shippingOptions: StoreCartShippingOption[]
}

type LayoutSessionContextValue = LayoutSession & {
  hydrated: boolean
  refresh: () => Promise<void>
}

const emptySession: LayoutSession = {
  customer: null,
  cart: null,
  shippingOptions: [],
}

const LayoutSessionContext = createContext<LayoutSessionContextValue>({
  ...emptySession,
  hydrated: false,
  refresh: async () => undefined,
})

export const LAYOUT_SESSION_REFRESH_EVENT = "petboxnest:layout-session-refresh"

export function notifyLayoutSessionChanged() {
  window.dispatchEvent(new Event(LAYOUT_SESSION_REFRESH_EVENT))
}

export function LayoutSessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [session, setSession] = useState<LayoutSession>(emptySession)
  // Keep the server fallback and the first client render identical. The
  // actual cart is loaded after hydration, then the count can update safely.
  const [hydrated, setHydrated] = useState(false)
  const pathname = usePathname()

  const refresh = useCallback(async () => {
    const nextSession = await retrieveLayoutSession().catch(() => emptySession)
    setSession(nextSession)
    setHydrated(true)
  }, [])

  useEffect(() => {
    void refresh()
  }, [pathname, refresh])

  useEffect(() => {
    const handleRefresh = () => void refresh()
    window.addEventListener(LAYOUT_SESSION_REFRESH_EVENT, handleRefresh)
    return () =>
      window.removeEventListener(LAYOUT_SESSION_REFRESH_EVENT, handleRefresh)
  }, [refresh])

  return (
    <LayoutSessionContext.Provider value={{ ...session, hydrated, refresh }}>
      {children}
    </LayoutSessionContext.Provider>
  )
}

export const useLayoutSession = () => useContext(LayoutSessionContext)
