import { Badge, Button, Container, Drawer, Heading, Input, Select, Table, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { sdk } from "../lib/sdk"

type Log = { id: string; status: string; attempt_count: number; error_message: string | null; next_retry_at: string | null; created_at: string }
type RecordItem = { id: string; email: string; status: string; created_at: string; consent_given: boolean; consented_at: string; consent_source: string; logs: Log[]; variant_id?: string; cart_id?: string; send_count?: number; last_sent_at?: string | null }
type Response = { subscriptions?: RecordItem[]; recoveries?: RecordItem[]; count: number; page_count: number; summary: Record<string, number> }

const statusColor = (status: string) => status === "sent" || status === "notified" || status === "recovered" ? "green" : status === "unsubscribed" || status === "expired" ? "grey" : status === "failed" ? "red" : "orange"
const statusLabel: Record<string, string> = { active: "生效 / Active", notified: "已通知 / Notified", unsubscribed: "已退订 / Unsubscribed", eligible: "待发送 / Eligible", sent: "已发送 / Sent", recovered: "已恢复 / Recovered", expired: "已过期 / Expired", pending: "发送中 / Pending", failed: "失败 / Failed" }

export default function CommerceAutomationList({ feature }: { feature: "restock" | "cart-recovery" }) {
  const isRestock = feature === "restock"
  const api = isRestock ? "/admin/restock-notifications" : "/admin/cart-recoveries"
  const key = isRestock ? "restock-notifications" : "cart-recoveries"
  const client = useQueryClient()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")
  const [active, setActive] = useState<RecordItem | null>(null)
  useEffect(() => { const timer = setTimeout(() => { setQuery(search.trim()); setPage(1) }, 300); return () => clearTimeout(timer) }, [search])
  const list = useQuery({ queryKey: [key, page, limit, query, status], queryFn: () => sdk.client.fetch<Response>(api, { query: { page, limit, q: query || undefined, status: status === "all" ? undefined : status } }) })
  const mutate = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "retry" | "unsubscribe" }) => sdk.client.fetch(`${api}/${id}/${action}`, { method: "POST" }),
    onSuccess: async () => { setActive(null); await client.invalidateQueries({ queryKey: [key] }); toast.success("操作已完成 / Action completed") },
    onError: (error: Error) => toast.error(error.message),
  })
  const rows = (isRestock ? list.data?.subscriptions : list.data?.recoveries) || []
  const summary = list.data?.summary || {}
  const statuses = isRestock ? ["active", "notified", "unsubscribed"] : ["eligible", "sent", "recovered", "unsubscribed", "expired"]

  return <div className="flex flex-col gap-y-3"><Container className="p-0">
    <div className="flex flex-col gap-4 border-b px-6 py-5 lg:flex-row lg:items-center lg:justify-between"><div>
      <Heading level="h1">{isRestock ? "缺货通知" : "弃购恢复"}</Heading>
      <Text size="small" className="text-ui-fg-subtle">{isRestock ? "Restock notifications · 管理订阅、发送结果、重试和退订记录。" : "Abandoned cart recovery · 管理一次性恢复链接、发送结果、重试和退订记录。"}</Text>
    </div><div className="flex flex-wrap gap-2">{Object.entries(summary).map(([name, value]) => <div key={name} className="rounded-md border px-3 py-2"><Text size="xsmall" className="text-ui-fg-subtle">{name}</Text><Text weight="plus">{value}</Text></div>)}</div></div>
    <div className="flex flex-col gap-3 border-b px-6 py-4 sm:flex-row"><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索邮箱、商品规格或购物车 ID" className="sm:max-w-sm" /><Select value={status} onValueChange={(value) => { setStatus(value); setPage(1) }}><Select.Trigger className="sm:w-56"><Select.Value /></Select.Trigger><Select.Content><Select.Item value="all">全部状态 / All statuses</Select.Item>{statuses.map((value) => <Select.Item key={value} value={value}>{statusLabel[value]}</Select.Item>)}</Select.Content></Select>{(query || status !== "all") && <Button variant="secondary" size="small" onClick={() => { setSearch(""); setQuery(""); setStatus("all"); setPage(1) }}>清除筛选 / Clear</Button>}</div>
    {list.isError ? <div className="px-6 py-16 text-center"><Heading level="h2">加载失败 / Failed to load</Heading><Button className="mt-4" size="small" onClick={() => list.refetch()}>重试 / Retry</Button></div> : <div className="overflow-x-auto"><Table><Table.Header><Table.Row><Table.HeaderCell>邮箱 / Email</Table.HeaderCell><Table.HeaderCell>{isRestock ? "规格 / Variant" : "购物车 / Cart"}</Table.HeaderCell><Table.HeaderCell>状态 / Status</Table.HeaderCell><Table.HeaderCell>隐私同意 / Consent</Table.HeaderCell><Table.HeaderCell>最近发送 / Last send</Table.HeaderCell></Table.Row></Table.Header><Table.Body>{rows.map((item) => <Table.Row key={item.id} className="cursor-pointer" onClick={() => setActive(item)}><Table.Cell>{item.email}</Table.Cell><Table.Cell>{item.variant_id || item.cart_id}</Table.Cell><Table.Cell><Badge color={statusColor(item.status) as any}>{statusLabel[item.status] || item.status}</Badge></Table.Cell><Table.Cell>{item.consent_given ? <><div>已同意 / Yes</div><Text size="xsmall" className="text-ui-fg-subtle">{item.consent_source}</Text></> : "否 / No"}</Table.Cell><Table.Cell>{item.last_sent_at ? new Date(item.last_sent_at).toLocaleString() : item.logs?.[0] ? new Date(item.logs[0].created_at).toLocaleString() : "—"}</Table.Cell></Table.Row>)}</Table.Body></Table>{!list.isLoading && !rows.length && <div className="px-6 py-16 text-center"><Text className="text-ui-fg-subtle">暂无记录 / No records</Text></div>}</div>}
    <div className="flex items-center justify-between border-t px-6 py-4"><Text size="small">第 {page} 页，共 {list.data?.page_count || 1} 页 · {list.data?.count || 0} 条</Text><div className="flex gap-2"><Select value={String(limit)} onValueChange={(value) => { setLimit(Number(value)); setPage(1) }}><Select.Trigger className="w-24"><Select.Value /></Select.Trigger><Select.Content>{[20, 50, 100].map((size) => <Select.Item key={size} value={String(size)}>{size} 条</Select.Item>)}</Select.Content></Select><Button size="small" variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>上一页</Button><Button size="small" variant="secondary" disabled={page >= (list.data?.page_count || 1)} onClick={() => setPage((value) => value + 1)}>下一页</Button></div></div>
  </Container><Drawer open={Boolean(active)} onOpenChange={(open) => !open && setActive(null)}><Drawer.Content><Drawer.Header><Heading>{isRestock ? "缺货通知详情" : "弃购恢复详情"}</Heading></Drawer.Header><Drawer.Body className="space-y-5 overflow-y-auto"><div className="rounded-md border p-4"><Text weight="plus">{active?.email}</Text><Text size="small" className="text-ui-fg-subtle">{active?.variant_id || active?.cart_id}</Text><div className="mt-2"><Badge color={statusColor(active?.status || "") as any}>{statusLabel[active?.status || ""] || active?.status}</Badge></div><Text size="small" className="mt-3">同意时间 / Consented: {active?.consented_at ? new Date(active.consented_at).toLocaleString() : "—"}</Text><Text size="small">同意来源 / Source: {active?.consent_source}</Text></div><div><Heading level="h2">发送日志 / Delivery logs</Heading><div className="mt-3 space-y-2">{active?.logs?.length ? active.logs.map((log) => <div key={log.id} className="rounded-md border p-3"><div className="flex justify-between"><Badge color={statusColor(log.status) as any}>{statusLabel[log.status] || log.status}</Badge><Text size="xsmall">#{log.attempt_count}</Text></div><Text size="small" className="mt-2">{new Date(log.created_at).toLocaleString()}</Text>{log.error_message && <Text size="small" className="mt-1 text-ui-fg-error">{log.error_message}</Text>}{log.next_retry_at && <Text size="xsmall">下次重试 / Next retry: {new Date(log.next_retry_at).toLocaleString()}</Text>}</div>) : <Text size="small" className="text-ui-fg-subtle">暂无发送日志 / No delivery logs</Text>}</div></div></Drawer.Body><Drawer.Footer><Button variant="secondary" onClick={() => active && window.confirm("确认退订该记录？ / Confirm unsubscribe?") && mutate.mutate({ id: active.id, action: "unsubscribe" })}>退订 / Unsubscribe</Button><Button disabled={mutate.isPending || active?.status === "unsubscribed" || active?.status === "recovered"} onClick={() => active && window.confirm("确认立即重试发送？ / Retry now?") && mutate.mutate({ id: active.id, action: "retry" })}>重试发送 / Retry</Button></Drawer.Footer></Drawer.Content></Drawer></div>
}
