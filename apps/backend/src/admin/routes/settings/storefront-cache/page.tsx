import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Text, toast } from "@medusajs/ui"
import { useState } from "react"

import { sdk } from "../../../lib/sdk"

const StorefrontCacheSettingsPage = () => {
  const [isClearing, setIsClearing] = useState(false)

  const clearCache = async () => {
    setIsClearing(true)

    try {
      await sdk.client.fetch("/admin/storefront-cache/clear", {
        method: "POST",
      })
      toast.success("店面缓存已清除 / Storefront cache cleared")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `清除失败 / Clear failed: ${error.message}`
          : "清除店面缓存失败 / Failed to clear storefront cache"
      )
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h1">店面缓存</Heading>
        <Text size="small" leading="compact" className="text-ui-fg-subtle">
          Storefront Cache
        </Text>
        <Text size="small" leading="compact" className="mt-2">
          CMS 或商品目录更新后，清除店面缓存内容。
        </Text>
        <Text size="small" leading="compact" className="text-ui-fg-subtle">
          Clear cached storefront content after CMS or catalog updates.
        </Text>
      </div>
      <div className="flex items-center justify-between gap-3 px-6 py-4">
        <div>
          <Text size="small" leading="compact" weight="plus">
            业务缓存
          </Text>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Business cache
          </Text>
          <Text size="small" leading="compact" className="mt-2">
            清除 Payload 内容缓存和 Medusa 店面缓存标签。
          </Text>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Clears Payload content and Medusa storefront cache tags.
          </Text>
        </div>
        <Button
          size="small"
          onClick={clearCache}
          isLoading={isClearing}
          disabled={isClearing}
          className="h-auto py-1"
        >
          <div className="flex flex-col items-center">
            <Text size="xsmall" leading="compact" weight="plus">
              清除缓存
            </Text>
            <Text size="xsmall" leading="compact">
              Clear cache
            </Text>
          </div>
        </Button>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "店面缓存 / Storefront Cache",
})

export default StorefrontCacheSettingsPage
