import { defineRouteConfig } from "@medusajs/admin-sdk"
import { BuildingStorefront, Plus, Spinner } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Select,
  Table,
  Text,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ProcurementNav } from "../../components/procurement-nav"
import { PurchaseOrderEditor } from "../../components/purchase-order-editor"
import { formatAmount, formatDate } from "../../lib/format"
import { sdk } from "../../lib/sdk"
import type {
  ProcurementAnalytics,
  PurchaseOrderListResponse,
  SupplierListResponse,
} from "../../types"

const statusMeta = {
  draft: { label: "草稿 / Draft", color: "grey" as const },
  ordered: { label: "已下单 / Ordered", color: "blue" as const },
  partially_received: { label: "部分收货 / Partial", color: "orange" as const },
  received: { label: "已收货 / Received", color: "green" as const },
  cancelled: { label: "已取消 / Cancelled", color: "red" as const },
}

const paymentMeta = {
  unpaid: { label: "未付款 / Unpaid", color: "grey" as const },
  partially_paid: { label: "部分付款 / Partial", color: "orange" as const },
  paid: { label: "已付款 / Paid", color: "green" as const },
  refunded: { label: "已退款 / Refunded", color: "purple" as const },
}

const ProcurementPage = () => {
  const [editorOpen, setEditorOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")
  const [paymentStatus, setPaymentStatus] = useState("all")
  const [supplierId, setSupplierId] = useState("all")
  const [page, setPage] = useState(1)
  const limit = 20

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(search.trim())
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [search])

  const analytics = useQuery({
    queryKey: ["procurement-analytics"],
    queryFn: () => sdk.client.fetch<ProcurementAnalytics>("/admin/procurement/analytics"),
  })
  const suppliers = useQuery({
    queryKey: ["procurement-suppliers-filter"],
    queryFn: () =>
      sdk.client.fetch<SupplierListResponse>("/admin/procurement/suppliers", {
        query: { page: 1, limit: 100 },
      }),
  })
  const orders = useQuery({
    queryKey: ["procurement-orders", page, query, status, paymentStatus, supplierId],
    queryFn: () =>
      sdk.client.fetch<PurchaseOrderListResponse>("/admin/procurement/orders", {
        query: {
          page,
          limit,
          q: query || undefined,
          status: status === "all" ? undefined : status,
          payment_status: paymentStatus === "all" ? undefined : paymentStatus,
          supplier_id: supplierId === "all" ? undefined : supplierId,
        },
      }),
  })

  const summary = analytics.data?.summary
  const exportCsv = () => {
    const rows = orders.data?.purchase_orders || []
    const header = ["Order", "Supplier", "Status", "Payment", "Currency", "Total", "Paid", "Outstanding", "Created"]
    const body = rows.map((order) => [
      order.order_number,
      order.supplier_name,
      order.status,
      order.payment_status,
      order.currency_code,
      order.total_amount,
      order.paid_amount,
      order.outstanding_amount,
      order.created_at,
    ])
    const csv = [header, ...body]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `procurement-orders-page-${page}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div>
            <Heading>采购管理</Heading>
            <Text size="small" className="text-ui-fg-subtle">Procurement · 独立采购记录、付款、收货与成本统计</Text>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="small" variant="secondary" onClick={exportCsv}>导出当前页 / Export CSV</Button>
            <Button size="small" onClick={() => setEditorOpen(true)}><Plus /> 新建采购单 / New order</Button>
          </div>
        </div>
        <div className="border-t px-6 py-4"><ProcurementNav /></div>
      </Container>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["采购总额 / Total", formatAmount(summary?.total_amount || 0, summary?.base_currency_code)],
          ["已付款 / Paid", formatAmount(summary?.paid_amount || 0, summary?.base_currency_code)],
          ["待付款 / Outstanding", formatAmount(summary?.outstanding_amount || 0, summary?.base_currency_code)],
          ["采购单 / Orders", String(summary?.total_orders || 0)],
          ["逾期 / Overdue", String(summary?.overdue_orders || 0)],
        ].map(([label, value]) => (
          <Container key={label} className="px-6 py-4">
            <Text size="small" className="text-ui-fg-subtle">{label}</Text>
            <Heading level="h2" className="mt-1">{analytics.isLoading ? "—" : value}</Heading>
          </Container>
        ))}
      </div>

      <Container className="divide-y p-0">
        <div className="grid gap-3 px-6 py-4 md:grid-cols-4">
          <Input placeholder="搜索采购单号 / Search order" value={search} onChange={(event) => setSearch(event.target.value)} />
          <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1) }}>
            <Select.Trigger><Select.Value /></Select.Trigger>
            <Select.Content>
              <Select.Item value="all">全部状态 / All statuses</Select.Item>
              {Object.entries(statusMeta).map(([value, meta]) => <Select.Item key={value} value={value}>{meta.label}</Select.Item>)}
            </Select.Content>
          </Select>
          <Select value={paymentStatus} onValueChange={(value) => { setPaymentStatus(value); setPage(1) }}>
            <Select.Trigger><Select.Value /></Select.Trigger>
            <Select.Content>
              <Select.Item value="all">全部付款状态 / All payments</Select.Item>
              {Object.entries(paymentMeta).map(([value, meta]) => <Select.Item key={value} value={value}>{meta.label}</Select.Item>)}
            </Select.Content>
          </Select>
          <Select value={supplierId} onValueChange={(value) => { setSupplierId(value); setPage(1) }}>
            <Select.Trigger><Select.Value /></Select.Trigger>
            <Select.Content>
              <Select.Item value="all">全部供应商 / All suppliers</Select.Item>
              {(suppliers.data?.suppliers || []).map((supplier) => <Select.Item key={supplier.id} value={supplier.id}>{supplier.name}</Select.Item>)}
            </Select.Content>
          </Select>
        </div>
        {orders.isLoading ? (
          <div className="flex justify-center p-16"><Spinner /></div>
        ) : (
          <Table>
            <Table.Header><Table.Row><Table.HeaderCell>采购单 / Order</Table.HeaderCell><Table.HeaderCell>供应商 / Supplier</Table.HeaderCell><Table.HeaderCell>项目 / Items</Table.HeaderCell><Table.HeaderCell>金额 / Total</Table.HeaderCell><Table.HeaderCell>状态 / Status</Table.HeaderCell><Table.HeaderCell>付款 / Payment</Table.HeaderCell><Table.HeaderCell>创建时间 / Created</Table.HeaderCell></Table.Row></Table.Header>
            <Table.Body>
              {(orders.data?.purchase_orders || []).map((order) => (
                <Table.Row key={order.id}>
                  <Table.Cell><Link className="text-ui-fg-interactive hover:underline" to={`/procurement/orders/${order.id}`}>{order.order_number}</Link></Table.Cell>
                  <Table.Cell>{order.supplier_name}</Table.Cell>
                  <Table.Cell>{order.item_count || 0}</Table.Cell>
                  <Table.Cell>{formatAmount(order.total_amount, order.currency_code)}</Table.Cell>
                  <Table.Cell><Badge color={statusMeta[order.status].color}>{statusMeta[order.status].label}</Badge></Table.Cell>
                  <Table.Cell><Badge color={paymentMeta[order.payment_status].color}>{paymentMeta[order.payment_status].label}</Badge></Table.Cell>
                  <Table.Cell>{formatDate(order.created_at)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
        {!orders.isLoading && !orders.data?.purchase_orders.length && <div className="px-6 py-16 text-center"><Heading level="h2">还没有采购单</Heading><Text className="text-ui-fg-subtle">Create the first purchase order.</Text></div>}
        <div className="flex items-center justify-between px-6 py-4">
          <Text size="small">共 {orders.data?.count || 0} 条 / {orders.data?.count || 0} orders</Text>
          <div className="flex items-center gap-2"><Button size="small" variant="secondary" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>上一页</Button><Text size="small">{page} / {orders.data?.page_count || 1}</Text><Button size="small" variant="secondary" disabled={page >= (orders.data?.page_count || 1)} onClick={() => setPage((current) => current + 1)}>下一页</Button></div>
        </div>
      </Container>
      <PurchaseOrderEditor open={editorOpen} onOpenChange={setEditorOpen} />
    </div>
  )
}

export const config = defineRouteConfig({
  label: "采购管理 / Procurement",
  icon: BuildingStorefront,
  rank: 40,
})

export default ProcurementPage
