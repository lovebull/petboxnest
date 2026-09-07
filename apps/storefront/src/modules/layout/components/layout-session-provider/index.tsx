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
  refresh: () => Promise<void>
}

const emptySession: LayoutSession = {
  customer: null,
  cart: null,
  shippingOptions: [],
}

const LayoutSessionContext = createContext<LayoutSessionContextValue>({
  ...emptySession,
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
  const pathname = usePathname()

  const refresh = useCallback(async () => {
    const nextSession = await retrieveLayoutSession().catch(() => emptySession)
    setSession(nextSession)
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
    <LayoutSessionContext.Provider value={{ ...session, refresh }}>
      {children}
    </LayoutSessionContext.Provider>
  )
}

export const useLayoutSession = () => useContext(LayoutSessionContext)
