"use client"

import { trackStorefrontEvent } from "@lib/analytics/client"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

const OrderAnalytics = ({ orderId }: { orderId: string }) => {
  const pathname = usePathname()

  useEffect(() => {
    void trackStorefrontEvent("order_completed", {
      path: pathname,
      country_code: pathname.split("/").filter(Boolean)[0],
      order_id: orderId,
    }).catch(() => undefined)
  }, [orderId, pathname])

  return null
}

export default OrderAnalytics
