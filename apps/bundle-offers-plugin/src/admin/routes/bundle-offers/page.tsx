import { defineRouteConfig } from "@medusajs/admin-sdk"
import { BuildingStorefront, Plus, Trash } from "@medusajs/icons"
import { Badge, Button, Container, Heading, Select, Table, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { BundleOfferEditor } from "../../components/bundle-offer-editor"
import { sdk } from "../../lib/sdk"
import type { AdminBundleOffer, BundleOfferListResponse } from "../../types"

const statusMeta = {
  draft: { label: "草稿 / Draft", color: "grey" as const },
  active: { label: "启用 / Active", color: "green" as const },
  archived: { label: "归档 / Archived", color: "orange" as const },
}

const BundleOffersPage = () => {
  const [searchParams] = useSearchParams()
  const initialProductId = searchParams.get("product_id") || undefined
  const queryClient = useQueryClient()
  const [status, setStatus] = useState("all")
  const [page, setPage] = useState(1)
  const [editorOpen, setEditorOpen] = useState(false)
  const [activeOffer, setActiveOffer] = useState<AdminBundleOffer | null>(null)
  const limit = 20
  const list = useQuery({
    queryKey: ["bundle-offers", status, page, initialProductId],
    queryFn: () => sdk.client.fetch<BundleOfferListResponse>("/admin/bundle-offers", {
      query: { product_id: initialProductId, status: status === "all" ? undefined : status, limit, offset: (page - 1) * limit },
    }),
  })
  const products = useQuery({
    queryKey: ["bundle-offers-product-labels"],
    queryFn: async () => (await sdk.admin.product.list({ limit: 100 })).products,
  })
  const productNames = useMemo(() => new Map((products.data || []).map((product) => [product.id, product.title])), [products.data])
  const pageCount = Math.max(1, Math.ceil((list.data?.count || 0) / limit))
  const remove = useMutation({
    mutationFn: (id: string) => sdk.client.fetch(`/admin/bundle-offers/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["bundle-offers"] })
      toast.success("套餐已删除 / Bundle offer deleted")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return (
    <>
      <Container className="divide-y p-0">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div><Heading>套餐管理</Heading><Text size="small" className="text-ui-fg-subtle">Bundle Offers · 变体价格 + 原生库存套件</Text></div>
          <Button onClick={() => { setActiveOffer(null); setEditorOpen(true) }}><Plus /> 新建套餐 / New offer</Button>
        </div>
        <div className="flex items-center justify-between gap-4 px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">套餐展示只负责选择体验；实际价格、购物车、订单与库存继续使用 Medusa 标准逻辑。</Text>
          <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1) }}>
            <Select.Trigger className="w-44"><Select.Value /></Select.Trigger>
            <Select.Content><Select.Item value="all">全部状态 / All</Select.Item><Select.Item value="draft">草稿 / Draft</Select.Item><Select.Item value="active">启用 / Active</Select.Item><Select.Item value="archived">归档 / Archived</Select.Item></Select.Content>
          </Select>
        </div>
        <Table>
          <Table.Header><Table.Row><Table.HeaderCell>商品 / Product</Table.HeaderCell><Table.HeaderCell>标题 / Title</Table.HeaderCell><Table.HeaderCell>选项 / Options</Table.HeaderCell><Table.HeaderCell>状态 / Status</Table.HeaderCell><Table.HeaderCell>更新时间 / Updated</Table.HeaderCell><Table.HeaderCell /></Table.Row></Table.Header>
          <Table.Body>
            {(list.data?.bundle_offers || []).map((offer) => (
              <Table.Row key={offer.id} className="cursor-pointer" onClick={() => { setActiveOffer(offer); setEditorOpen(true) }}>
                <Table.Cell>{productNames.get(offer.product_id) || offer.product_id}</Table.Cell><Table.Cell>{offer.title}</Table.Cell><Table.Cell>{offer.options.length}</Table.Cell><Table.Cell><Badge color={statusMeta[offer.status].color}>{statusMeta[offer.status].label}</Badge></Table.Cell><Table.Cell>{new Date(offer.updated_at).toLocaleString()}</Table.Cell>
                <Table.Cell onClick={(event) => event.stopPropagation()}><Button size="small" variant="transparent" isLoading={remove.isPending} onClick={() => { if (window.confirm("确定永久删除此套餐配置？商品和变体不会删除。\nDelete this bundle configuration? The product and variants remain.")) remove.mutate(offer.id) }}><Trash /> 删除</Button></Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        {!list.isLoading && !list.data?.bundle_offers.length && <div className="px-6 py-16 text-center"><Heading level="h2">还没有套餐配置</Heading><Text className="text-ui-fg-subtle">Create the first reusable bundle offer.</Text></div>}
        <div className="flex items-center justify-between px-6 py-4"><Text size="small">共 {list.data?.count || 0} 条 / {list.data?.count || 0} offers</Text><div className="flex items-center gap-2"><Button size="small" variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>上一页</Button><Text size="small">{page} / {pageCount}</Text><Button size="small" variant="secondary" disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)}>下一页</Button></div></div>
      </Container>
      <BundleOfferEditor open={editorOpen} onOpenChange={setEditorOpen} offer={activeOffer} initialProductId={activeOffer ? undefined : initialProductId} />
    </>
  )
}

export const config = defineRouteConfig({ label: "套餐优惠 / Bundles", icon: BuildingStorefront, rank: 20 })
export default BundleOffersPage
