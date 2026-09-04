import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChatBubbleLeftRight, EllipsisHorizontal } from "@medusajs/icons"
import {
  Badge,
  Button,
  Checkbox,
  Container,
  Drawer,
  DropdownMenu,
  FocusModal,
  Heading,
  Input,
  IconButton,
  Select,
  Table,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FormEvent, useEffect, useState } from "react"
import { sdk } from "../../lib/sdk"

type Status = "pending" | "approved" | "flagged"
type Reply = { id: string; content: string; created_at: string }
type Review = {
  id: string; product_id: string; customer_id: string; reviewer_name: string
  rating: number; title: string | null; content: string; status: Status
  flag_reason: string | null; created_at: string
  product: { id: string; title: string; thumbnail?: string } | null
  reply: Reply | null
  audits?: Array<{ id: string; action: string; reason: string | null; created_at: string }>
}
type Response = {
  reviews: Review[]; count: number; page: number; page_count: number; page_size: number
  summary: { total: number; pending: number; approved: number; flagged: number; average_rating: number }
}

const statusLabel = { pending: "待审核", approved: "已批准", flagged: "已标记" }
const statusColor = { pending: "orange", approved: "green", flagged: "red" } as const

const ProductReviewsPage = () => {
  const client = useQueryClient()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")
  const [statuses, setStatuses] = useState<string[]>([])
  const [ratings, setRatings] = useState<string[]>([])
  const [productId, setProductId] = useState("")
  const [productTitle, setProductTitle] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [hasReply, setHasReply] = useState("all")
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [activeId, setActiveId] = useState<string | null>(null)
  useEffect(() => { const timer = setTimeout(() => { setQuery(search); setPage(1) }, 300); return () => clearTimeout(timer) }, [search])

  const list = useQuery({
    queryKey: ["product-reviews", page, limit, query, statuses, ratings, productId, dateFrom, dateTo, hasReply],
    queryFn: () => sdk.client.fetch<Response>("/admin/product-reviews", { query: { page, limit, q: query || undefined, statuses: statuses.length ? statuses.join(",") : undefined, ratings: ratings.length ? ratings.join(",") : undefined, product_id: productId || undefined, date_from: dateFrom ? new Date(`${dateFrom}T00:00:00.000Z`).toISOString() : undefined, date_to: dateTo ? new Date(`${dateTo}T23:59:59.999Z`).toISOString() : undefined, has_reply: hasReply === "all" ? undefined : hasReply } }),
  })
  const detail = useQuery({
    queryKey: ["product-review", activeId],
    queryFn: () => sdk.client.fetch<{ review: Review }>(`/admin/product-reviews/${activeId}`),
    enabled: Boolean(activeId),
  })
  const invalidate = async () => {
    await Promise.all([client.invalidateQueries({ queryKey: ["product-reviews"] }), client.invalidateQueries({ queryKey: ["product-review"] })])
  }
  const statusMutation = useMutation({
    mutationFn: ({ id, next, reason }: { id: string; next: Status; reason?: string }) => sdk.client.fetch(`/admin/product-reviews/${id}/status`, { method: "POST", body: { status: next, reason } }),
    onSuccess: async () => { await invalidate(); toast.success("评论状态已更新") },
    onError: (error: Error) => toast.error(error.message),
  })
  const batchMutation = useMutation({
    mutationFn: ({ next, reason }: { next: Status; reason?: string }) => sdk.client.fetch("/admin/product-reviews/batch-status", { method: "POST", body: { ids: Object.keys(selected).filter((id) => selected[id]), status: next, reason } }),
    onSuccess: async () => { setSelected({}); await invalidate(); toast.success("批量审核已完成") },
    onError: (error: Error) => toast.error(error.message),
  })
  const rows = list.data?.reviews || []
  const selectedIds = Object.keys(selected).filter((id) => selected[id])
  const allSelected = rows.length > 0 && rows.every((review) => selected[review.id])

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="p-0">
        <div className="flex flex-col gap-4 border-b px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div><Heading level="h1">产品评论</Heading><Text className="text-ui-fg-subtle" size="small">审核客户反馈、管理官方回复并追踪评分。</Text></div>
          <div className="flex flex-wrap gap-2">
            <Stat label="全部" value={list.data?.summary.total} />
            <Stat label="待审核" value={list.data?.summary.pending} />
            <Stat label="已批准" value={list.data?.summary.approved} />
            <Stat label="已标记" value={list.data?.summary.flagged} />
            <Stat label="平均分" value={list.data?.summary.average_rating} />
          </div>
        </div>
        <div className="flex flex-col gap-3 border-b px-6 py-4 lg:flex-row">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索标题、正文或客户名称" className="lg:max-w-sm" />
          <MultiFilter label="状态" values={statuses} options={[{ value: "pending", label: "待审核" }, { value: "approved", label: "已批准" }, { value: "flagged", label: "已标记" }]} onChange={(values) => { setStatuses(values); setPage(1) }} />
          <MultiFilter label="星级" values={ratings} options={[5,4,3,2,1].map((star) => ({ value: String(star), label: `${star} 星` }))} onChange={(values) => { setRatings(values); setPage(1) }} />
          <ProductFilter productId={productId} productTitle={productTitle} onChange={(id, title) => { setProductId(id); setProductTitle(title); setPage(1) }} />
          <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1) }} aria-label="开始日期" className="lg:w-40" />
          <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1) }} aria-label="结束日期" className="lg:w-40" />
          <Select value={hasReply} onValueChange={(value) => { setHasReply(value); setPage(1) }}><Select.Trigger className="lg:w-36"><Select.Value /></Select.Trigger><Select.Content><Select.Item value="all">全部回复</Select.Item><Select.Item value="true">已回复</Select.Item><Select.Item value="false">未回复</Select.Item></Select.Content></Select>
          {(query || statuses.length || ratings.length || productId || dateFrom || dateTo || hasReply !== "all") && <Button size="small" variant="secondary" onClick={() => { setSearch(""); setQuery(""); setStatuses([]); setRatings([]); setProductId(""); setProductTitle(""); setDateFrom(""); setDateTo(""); setHasReply("all"); setPage(1) }}>清除筛选</Button>}
          {selectedIds.length > 0 && <div className="flex flex-wrap gap-2"><Button size="small" onClick={() => window.confirm(`确认批准 ${selectedIds.length} 条评论？`) && batchMutation.mutate({ next: "approved" })}>批准 {selectedIds.length} 条</Button><Button size="small" variant="secondary" onClick={() => window.confirm(`确认将 ${selectedIds.length} 条评论恢复为待审核？`) && batchMutation.mutate({ next: "pending" })}>恢复待审核</Button><Button size="small" variant="danger" onClick={() => { const reason = window.prompt("请输入标记原因"); if (reason && window.confirm(`确认标记 ${selectedIds.length} 条评论？`)) batchMutation.mutate({ next: "flagged", reason }) }}>标记</Button></div>}
        </div>
        <div className="overflow-x-auto">
          <Table><Table.Header><Table.Row><Table.HeaderCell><Checkbox checked={allSelected} onCheckedChange={(checked) => setSelected(Object.fromEntries(rows.map((row) => [row.id, Boolean(checked)])))} /></Table.HeaderCell><Table.HeaderCell>产品</Table.HeaderCell><Table.HeaderCell>客户</Table.HeaderCell><Table.HeaderCell>评分</Table.HeaderCell><Table.HeaderCell>评论</Table.HeaderCell><Table.HeaderCell>状态</Table.HeaderCell><Table.HeaderCell>回复</Table.HeaderCell><Table.HeaderCell>提交时间</Table.HeaderCell><Table.HeaderCell>操作</Table.HeaderCell></Table.Row></Table.Header>
            <Table.Body>{rows.map((review) => <Table.Row key={review.id} className="cursor-pointer" onClick={() => setActiveId(review.id)}><Table.Cell onClick={(e) => e.stopPropagation()}><Checkbox checked={Boolean(selected[review.id])} onCheckedChange={(checked) => setSelected((current) => ({ ...current, [review.id]: Boolean(checked) }))} /></Table.Cell><Table.Cell>{review.product?.title || review.product_id}</Table.Cell><Table.Cell>{review.reviewer_name}</Table.Cell><Table.Cell><span className="text-ui-tag-orange-icon">{"★".repeat(review.rating)}</span></Table.Cell><Table.Cell className="max-w-xs truncate">{review.title || review.content}</Table.Cell><Table.Cell><Badge color={statusColor[review.status]}>{statusLabel[review.status]}</Badge></Table.Cell><Table.Cell>{review.reply ? "已回复" : "未回复"}</Table.Cell><Table.Cell>{new Date(review.created_at).toLocaleDateString()}</Table.Cell><Table.Cell onClick={(event) => event.stopPropagation()}><DropdownMenu><DropdownMenu.Trigger asChild><IconButton size="small" variant="transparent" aria-label="评论操作"><EllipsisHorizontal /></IconButton></DropdownMenu.Trigger><DropdownMenu.Content><DropdownMenu.Item onClick={() => setActiveId(review.id)}>查看详情</DropdownMenu.Item><DropdownMenu.Item onClick={() => statusMutation.mutate({ id: review.id, next: "approved" })}>批准</DropdownMenu.Item><DropdownMenu.Item onClick={() => statusMutation.mutate({ id: review.id, next: "pending" })}>恢复待审核</DropdownMenu.Item><DropdownMenu.Separator/><DropdownMenu.Item onClick={() => { const reason = window.prompt("请输入标记原因"); if (reason) statusMutation.mutate({ id: review.id, next: "flagged", reason }) }}>标记</DropdownMenu.Item></DropdownMenu.Content></DropdownMenu></Table.Cell></Table.Row>)}</Table.Body>
          </Table>
          {!list.isLoading && !rows.length && <div className="px-6 py-16 text-center"><Text className="text-ui-fg-subtle">没有符合条件的评论</Text></div>}
        </div>
        <div className="flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Text size="small">第 {page} 页，共 {list.data?.page_count || 1} 页 · {list.data?.count || 0} 条</Text>
          <div className="flex items-center gap-2"><Select value={String(limit)} onValueChange={(value) => { setLimit(Number(value)); setPage(1) }}><Select.Trigger className="w-24"><Select.Value /></Select.Trigger><Select.Content>{[20,50,100].map((size) => <Select.Item key={size} value={String(size)}>{size} 条</Select.Item>)}</Select.Content></Select><Button size="small" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>上一页</Button><Input type="number" min={1} max={list.data?.page_count || 1} value={page} onChange={(e) => setPage(Math.max(1, Math.min(Number(e.target.value), list.data?.page_count || 1)))} className="w-16"/><Button size="small" variant="secondary" disabled={page >= (list.data?.page_count || 1)} onClick={() => setPage((p) => p + 1)}>下一页</Button></div>
        </div>
      </Container>
      <ReviewDrawer review={detail.data?.review || null} open={Boolean(activeId)} onOpenChange={(open) => !open && setActiveId(null)} onStatus={(next, reason) => activeId && statusMutation.mutate({ id: activeId, next, reason })} onUpdated={invalidate} />
    </div>
  )
}

function Stat({ label, value }: { label: string; value?: number }) { return <div className="rounded-md bg-ui-bg-subtle px-3 py-2"><Text size="xsmall" className="text-ui-fg-subtle">{label}</Text><Text weight="plus">{value ?? "—"}</Text></div> }

function MultiFilter({ label, values, options, onChange }: { label: string; values: string[]; options: Array<{ value: string; label: string }>; onChange: (values: string[]) => void }) {
  return <DropdownMenu><DropdownMenu.Trigger asChild><Button size="small" variant="secondary">{label}{values.length ? ` (${values.length})` : ""}</Button></DropdownMenu.Trigger><DropdownMenu.Content>{options.map((option) => <DropdownMenu.CheckboxItem key={option.value} checked={values.includes(option.value)} onCheckedChange={(checked) => onChange(checked ? [...values, option.value] : values.filter((value) => value !== option.value))} onSelect={(event) => event.preventDefault()}>{option.label}</DropdownMenu.CheckboxItem>)}</DropdownMenu.Content></DropdownMenu>
}

function ProductFilter({ productId, productTitle, onChange }: { productId: string; productTitle: string; onChange: (id: string, title: string) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const limit = 20
  const products = useQuery({ queryKey: ["review-product-filter", search, page], queryFn: () => sdk.admin.product.list({ q: search || undefined, limit, offset: page * limit }), enabled: open })
  return <><Button size="small" variant="secondary" onClick={() => setOpen(true)}>{productId ? productTitle || "已选产品" : "选择产品"}</Button>{productId && <Button size="small" variant="transparent" onClick={() => onChange("", "")}>移除产品</Button>}<FocusModal open={open} onOpenChange={setOpen}><FocusModal.Content><FocusModal.Header><Heading level="h1">选择产品</Heading></FocusModal.Header><FocusModal.Body className="flex flex-col overflow-hidden"><div className="border-b p-4"><Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(0) }} placeholder="搜索产品名称" /></div><div className="flex-1 overflow-y-auto p-4"><Table><Table.Header><Table.Row><Table.HeaderCell>产品</Table.HeaderCell><Table.HeaderCell>ID</Table.HeaderCell><Table.HeaderCell></Table.HeaderCell></Table.Row></Table.Header><Table.Body>{products.data?.products.map((product) => <Table.Row key={product.id}><Table.Cell>{product.title}</Table.Cell><Table.Cell>{product.id}</Table.Cell><Table.Cell><Button size="small" onClick={() => { onChange(product.id, product.title); setOpen(false) }}>选择</Button></Table.Cell></Table.Row>)}</Table.Body></Table></div><div className="flex items-center justify-between border-t p-4"><Text size="small">第 {page + 1} 页，共 {Math.max(1, Math.ceil((products.data?.count || 0) / limit))} 页</Text><div className="flex gap-2"><Button size="small" variant="secondary" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>上一页</Button><Button size="small" variant="secondary" disabled={(page + 1) * limit >= (products.data?.count || 0)} onClick={() => setPage((current) => current + 1)}>下一页</Button></div></div></FocusModal.Body></FocusModal.Content></FocusModal></>
}

function ReviewDrawer({ review, open, onOpenChange, onStatus, onUpdated }: { review: Review | null; open: boolean; onOpenChange: (open: boolean) => void; onStatus: (status: Status, reason?: string) => void; onUpdated: () => Promise<void> }) {
  const [reply, setReply] = useState("")
  useEffect(() => setReply(review?.reply?.content || ""), [review?.reply?.content])
  const mutation = useMutation({ mutationFn: () => sdk.client.fetch(`/admin/product-reviews/${review!.id}/reply`, { method: "POST", body: { content: reply } }), onSuccess: async () => { await onUpdated(); toast.success("商家回复已保存") }, onError: (error: Error) => toast.error(error.message) })
  const remove = useMutation({ mutationFn: () => sdk.client.fetch(`/admin/product-reviews/${review!.id}/reply`, { method: "DELETE" }), onSuccess: async () => { setReply(""); await onUpdated(); toast.success("商家回复已删除") }, onError: (error: Error) => toast.error(error.message) })
  const flag = () => { const reason = window.prompt("请输入标记原因", review?.flag_reason || ""); if (reason) onStatus("flagged", reason) }
  return <Drawer open={open} onOpenChange={onOpenChange}><Drawer.Content><Drawer.Header><Drawer.Title>评论详情</Drawer.Title></Drawer.Header><Drawer.Body className="flex flex-col gap-5 overflow-y-auto p-6">{review && <><div><Text weight="plus">{review.product?.title || review.product_id}</Text><Text size="small" className="text-ui-fg-subtle">{review.reviewer_name} · {new Date(review.created_at).toLocaleString()}</Text></div><div><Text className="text-ui-tag-orange-icon">{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</Text>{review.title && <Heading level="h2" className="mt-2">{review.title}</Heading>}<Text className="mt-2 whitespace-pre-wrap">{review.content}</Text></div>{review.flag_reason && <div className="rounded-md bg-ui-bg-subtle p-3"><Text size="small">标记原因：{review.flag_reason}</Text></div>}<div className="flex flex-wrap gap-2"><Button size="small" onClick={() => onStatus("approved")}>批准</Button><Button size="small" variant="secondary" onClick={() => onStatus("pending")}>恢复待审核</Button><Button size="small" variant="danger" onClick={flag}>标记</Button></div><form onSubmit={(e: FormEvent) => { e.preventDefault(); mutation.mutate() }} className="flex flex-col gap-2"><Heading level="h2">商家回复</Heading><Textarea value={reply} onChange={(e) => setReply(e.target.value)} maxLength={2000} rows={6} disabled={review.status !== "approved"}/><Text size="xsmall" className="text-ui-fg-subtle">仅已批准评论可添加公开回复。</Text><div className="flex gap-2"><Button size="small" type="submit" disabled={review.status !== "approved" || reply.trim().length < 2}>保存回复</Button>{review.reply && <Button size="small" type="button" variant="danger" onClick={() => remove.mutate()}>删除回复</Button>}</div></form><div><Heading level="h2">审核记录</Heading><div className="mt-2 flex flex-col gap-2">{review.audits?.map((audit) => <div key={audit.id} className="border-l-2 border-ui-border-base pl-3"><Text size="small">{audit.action}{audit.reason ? ` · ${audit.reason}` : ""}</Text><Text size="xsmall" className="text-ui-fg-subtle">{new Date(audit.created_at).toLocaleString()}</Text></div>)}</div></div></>}</Drawer.Body></Drawer.Content></Drawer>
}

export const config = defineRouteConfig({ label: "产品评论", icon: ChatBubbleLeftRight })
export default ProductReviewsPage
