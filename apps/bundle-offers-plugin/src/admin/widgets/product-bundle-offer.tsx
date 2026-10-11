import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { AdminProduct, DetailWidgetProps } from "@medusajs/framework/types"
import { Button, Container, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { sdk } from "../lib/sdk"
import type { BundleOfferListResponse } from "../types"

const ProductBundleOfferWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const query = useQuery({ queryKey: ["bundle-offers", "product", data.id], queryFn: () => sdk.client.fetch<BundleOfferListResponse>("/admin/bundle-offers", { query: { product_id: data.id, limit: 1 } }) })
  const offer = query.data?.bundle_offers[0]
  return <Container className="p-0"><div className="flex items-start justify-between gap-4 px-6 py-4"><div><Heading level="h2">套餐销售配置</Heading><Text size="small" className="text-ui-fg-subtle">Bundle offer configuration</Text></div><Button asChild size="small" variant="secondary"><Link to={`/bundle-offers?product_id=${data.id}`}>{offer ? "编辑套餐 / Edit" : "创建套餐 / Create"}</Link></Button></div><div className="border-t border-ui-border-base px-6 py-4">{query.isLoading ? <Text size="small">正在载入 / Loading…</Text> : offer ? <div className="flex items-center justify-between"><div><Text weight="plus">{offer.title}</Text><Text size="small" className="text-ui-fg-subtle">{offer.options.length} 个选项 / {offer.options.length} options</Text></div><Text size="small">{offer.status === "active" ? "已启用 / Active" : offer.status === "draft" ? "草稿 / Draft" : "已归档 / Archived"}</Text></div> : <Text size="small" className="text-ui-fg-subtle">尚未配置套餐。商品仍按普通变体销售。<br />No offer configured. This product continues to use standard variants.</Text>}</div></Container>
}

export const config = defineWidgetConfig({ zone: "product.details", id: "petboxnest-product-bundle-offer" })
export default ProductBundleOfferWidget
