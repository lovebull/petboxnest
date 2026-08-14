import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, Container, Text, toast } from "@medusajs/ui"
import { useState } from "react"

const StorefrontCacheClearWidget = () => {
  const [isClearing, setIsClearing] = useState(false)

  const clearCache = async () => {
    setIsClearing(true)

    try {
      const response = await fetch("/admin/storefront-cache/clear", {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to clear storefront cache.")
      }

      toast.success("Storefront cache cleared.")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to clear storefront cache."
      )
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <Container className="flex items-center justify-between gap-3 px-6 py-4">
      <div>
        <Text size="small" leading="compact" weight="plus">
          Storefront cache
        </Text>
        <Text size="small" leading="compact" className="text-ui-fg-subtle">
          Clear cached storefront content after CMS or catalog updates.
        </Text>
      </div>
      <Button size="small" onClick={clearCache} isLoading={isClearing}>
        Clear cache
      </Button>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.list.before",
  id: "larumsport-storefront-cache-clear",
})

export default StorefrontCacheClearWidget
