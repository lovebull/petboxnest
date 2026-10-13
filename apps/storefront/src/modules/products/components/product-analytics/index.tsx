"use client"

import { trackStorefrontEvent } from "@lib/analytics/client"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

const ProductAnalytics = ({ productId }: { productId: string }) => {
  const pathname = usePathname()

  useEffect(() => {
    void trackStorefrontEvent("product_view", {
      path: pathname,
      country_code: pathname.split("/").filter(Boolean)[0],
      product_id: productId,
    }).catch(() => undefined)
  }, [pathname, productId])

  return null
}

export default ProductAnalytics
