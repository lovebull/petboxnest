import { ArrowLeft, PencilSquare, Spinner } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Drawer,
  FocusModal,
  Heading,
  Input,
  Label,
  Select,
  Table,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { formatAmount, formatDate } from "../../../../lib/format"
import { sdk } from "../../../../lib/sdk"
import type {
  PurchaseOrderDetail,
  PurchaseOrderFormItem,
  PurchaseOrderFormValue,
  SupplierListResponse,
} from "../../../../types"

type DetailResponse = { purchase_order: PurchaseOrderDetail }

const statusLabels: Record<string, string> = {
  draft: "草稿 / Draft",
  ordered: "已下单 / Ordered",
  partially_received: "部分收货 / Partially received",
  received: "已收货 / Received",
  cancelled: "已取消 / Cancelled",
}

const paymentLabels: Record<string, string> = {
  unpaid: "未付款 / Unpaid",
  partially_paid: "部分付款 / Partially paid",
  paid: "已付款 / Paid",
  refunded: "已退款 / Refunded",
}

const toDateInput = (value: string | null) => value ? value.slice(0, 10) : ""
const toEditValue = (order: PurchaseOrderDetail): PurchaseOrderFormValue => ({
  supplier_id: order.supplier_id,
  currency_code: order.currency_code,
  base_currency_code: order.base_currency_code,
  exchange_rate: Number(order.exchange_rate),
  shipping_amount: Number(order.shipping_amount),
  tax_amount: Number(order.tax_amount),
  discount_amount: Number(order.discount_amount),
  other_amount: Number(order.other_amount),
  ordered_at: toDateInput(order.ordered_at),
  expected_at: toDateInput(order.expected_at),
  notes: order.notes || "",
  items: order.items.map((item) => ({
    product_id: item.product_id,
    variant_id: item.variant_id,
    sku: item.sku || "",
    product_title: item.product_title,
    variant_title: item.variant_title || "",
    supplier_sku: item.supplier_sku || "",
    supplier_url: item.supplier_url || "",
    quantity: item.quantity,
    unit_cost: Number(item.unit_cost),
    notes: item.notes || "",
  })),
})

const OrderDetailPage = () => {
  const { id = "" } = useParams()
  const queryClient = useQueryClient()
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [payment, setPayment] = useState({ amount: 0, payment_method: "", transaction_reference: "", paid_at: "", notes: "" })
  const [receipt, setReceipt] = useState({ warehouse_name: "", received_at: "", notes: "", quantities: {} as Record<string, number> })
  const [editValue, setEditValue] = useState<PurchaseOrderFormValue | null>(null)

  const detail = useQuery({
    queryKey: ["procurement-order", id],
    queryFn: () => sdk.client.fetch<DetailResponse>(`/admin/procurement/orders/${id}`),
  })
  const suppliers = useQuery({
    queryKey: ["procurement-suppliers-for-order"],
    queryFn: () => sdk.client.fetch<SupplierListResponse>("/admin/procurement/suppliers", { query: { page: 1, limit: 100, status: "active" } }),
  })
  const order = detail.data?.purchase_order
  useEffect(() => {
    if (order) {
      setPayment((current) => ({ ...current, amount: Number(order.outstanding_amount) }))
      setReceipt((current) => ({ ...current, quantities: Object.fromEntries(order.items.map((item) => [item.id, Math.max(0, item.quantity - item.received_quantity)])) }))
      setEditValue(toEditValue(order))
    }
  }, [order])

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["procurement-order", id] }),
      queryClient.invalidateQueries({ queryKey: ["procurement-orders"] }),
      queryClient.invalidateQueries({ queryKey: ["procurement-analytics"] }),
    ])
  }
  const statusMutation = useMutation({
    mutationFn: (status: string) => sdk.client.fetch(`/admin/procurement/orders/${id}/status`, { method: "POST", body: { status } }),
    onSuccess: async () => { await refresh(); toast.success("采购单状态已更新 / Status updated") },
    onError: (error: Error) => toast.error(error.message),
  })
  const paymentMutation = useMutation({
    mutationFn: () => sdk.client.fetch(`/admin/procurement/orders/${id}/payments`, { method: "POST", body: { ...payment, currency_code: order?.currency_code, paid_at: payment.paid_at || null } }),
    onSuccess: async () => { await refresh(); setPaymentOpen(false); toast.success("付款已记录 / Payment recorded") },
    onError: (error: Error) => toast.error(error.message),
  })
  const receiptMutation = useMutation({
    mutationFn: () => sdk.client.fetch(`/admin/procurement/orders/${id}/receipts`, { method: "POST", body: { warehouse_name: receipt.warehouse_name, received_at: receipt.received_at || null, notes: receipt.notes, items: Object.entries(receipt.quantities).filter(([, quantity]) => quantity > 0).map(([order_item_id, quantity]) => ({ order_item_id, quantity })) } }),
    onSuccess: async () => { await refresh(); setReceiptOpen(false); toast.success("收货记录已保存 / Receipt recorded") },
    onError: (error: Error) => toast.error(error.message),
  })
  const editMutation = useMutation({
    mutationFn: () => sdk.client.fetch(`/admin/procurement/orders/${id}`, { method: "POST", body: { ...editValue, ordered_at: editValue?.ordered_at || null, expected_at: editValue?.expected_at || null } }),
    onSuccess: async () => { await refresh(); setEditOpen(false); toast.success("采购单已保存 / Purchase order saved") },
    onError: (error: Error) => toast.error(error.message),
  })

  if (detail.isLoading || !order) return <Container><div className="flex justify-center p-16"><Spinner /></div></Container>
  const availableTransitions = order.status === "draft" ? ["ordered", "cancelled"] : order.status === "ordered" ? ["received", "cancelled"] : order.status === "partially_received" ? ["received", "cancelled"] : []

  const updateEditItem = <K extends keyof PurchaseOrderFormItem>(index: number, key: K, value: PurchaseOrderFormItem[K]) => {
    setEditValue((current) => current ? { ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item) } : current)
  }

  return <div className="flex flex-col gap-y-3">
    <Container className="p-0">
      <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
        <div className="flex items-start gap-3"><Button size="small" variant="transparent" asChild><Link to="/procurement"><ArrowLeft /></Link></Button><div><div className="flex flex-wrap items-center gap-2"><Heading>{order.order_number}</Heading><Badge>{statusLabels[order.status]}</Badge><Badge>{paymentLabels[order.payment_status]}</Badge></div><Text size="small" className="text-ui-fg-subtle">{order.supplier_name} · {formatDate(order.created_at)}</Text></div></div>
        <div className="flex flex-wrap gap-2">
          {order.status === "draft" && <Button size="small" variant="secondary" onClick={() => setEditOpen(true)}><PencilSquare /> 编辑 / Edit</Button>}
          {availableTransitions.map((status) => <Button key={status} size="small" variant={status === "cancelled" ? "danger" : "secondary"} isLoading={statusMutation.isPending} onClick={() => statusMutation.mutate(status)}>{statusLabels[status]}</Button>)}
          {order.status !== "cancelled" && Number(order.outstanding_amount) > 0 && <Button size="small" onClick={() => setPaymentOpen(true)}>记录付款 / Payment</Button>}
          {["ordered", "partially_received"].includes(order.status) && <Button size="small" onClick={() => setReceiptOpen(true)}>记录收货 / Receipt</Button>}
        </div>
      </div>
    </Container>

    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex flex-col gap-3">
        <Container className="divide-y p-0"><div className="px-6 py-4"><Text weight="plus">采购明细 / Items</Text></div><Table><Table.Header><Table.Row><Table.HeaderCell>商品 / Item</Table.HeaderCell><Table.HeaderCell>SKU</Table.HeaderCell><Table.HeaderCell>数量 / Qty</Table.HeaderCell><Table.HeaderCell>已收 / Received</Table.HeaderCell><Table.HeaderCell>单位成本 / Unit</Table.HeaderCell><Table.HeaderCell>小计 / Total</Table.HeaderCell></Table.Row></Table.Header><Table.Body>{order.items.map((item) => <Table.Row key={item.id}><Table.Cell><div><Text size="small" weight="plus">{item.product_title}</Text><Text size="small" className="text-ui-fg-subtle">{item.variant_title || "—"}</Text></div></Table.Cell><Table.Cell>{item.sku || "—"}</Table.Cell><Table.Cell>{item.quantity}</Table.Cell><Table.Cell>{item.received_quantity}</Table.Cell><Table.Cell>{formatAmount(item.unit_cost, order.currency_code)}</Table.Cell><Table.Cell>{formatAmount(item.line_total, order.currency_code)}</Table.Cell></Table.Row>)}</Table.Body></Table></Container>
        <Container className="divide-y p-0"><div className="px-6 py-4"><Text weight="plus">付款记录 / Payments</Text></div>{order.payments.length ? <Table><Table.Header><Table.Row><Table.HeaderCell>时间</Table.HeaderCell><Table.HeaderCell>金额</Table.HeaderCell><Table.HeaderCell>方式</Table.HeaderCell><Table.HeaderCell>流水号</Table.HeaderCell></Table.Row></Table.Header><Table.Body>{order.payments.map((entry) => <Table.Row key={entry.id}><Table.Cell>{formatDate(entry.paid_at)}</Table.Cell><Table.Cell>{formatAmount(entry.amount, entry.currency_code)}</Table.Cell><Table.Cell>{entry.payment_method || "—"}</Table.Cell><Table.Cell>{entry.transaction_reference || "—"}</Table.Cell></Table.Row>)}</Table.Body></Table> : <div className="px-6 py-8"><Text size="small" className="text-ui-fg-subtle">暂无付款记录 / No payments</Text></div>}</Container>
        <Container className="divide-y p-0"><div className="px-6 py-4"><Text weight="plus">收货记录 / Receipts</Text></div>{order.receipts.length ? <Table><Table.Header><Table.Row><Table.HeaderCell>收货单</Table.HeaderCell><Table.HeaderCell>仓库</Table.HeaderCell><Table.HeaderCell>时间</Table.HeaderCell><Table.HeaderCell>项目</Table.HeaderCell></Table.Row></Table.Header><Table.Body>{order.receipts.map((entry) => <Table.Row key={entry.id}><Table.Cell>{entry.receipt_number}</Table.Cell><Table.Cell>{entry.warehouse_name || "—"}</Table.Cell><Table.Cell>{formatDate(entry.received_at)}</Table.Cell><Table.Cell>{entry.items.length}</Table.Cell></Table.Row>)}</Table.Body></Table> : <div className="px-6 py-8"><Text size="small" className="text-ui-fg-subtle">暂无收货记录 / No receipts</Text></div>}</Container>
      </div>
      <div className="flex flex-col gap-3">
        <Container className="divide-y p-0"><div className="px-6 py-4"><Text weight="plus">金额汇总 / Totals</Text></div><div className="flex flex-col gap-3 px-6 py-4">{[["商品小计", order.subtotal], ["运费", order.shipping_amount], ["税费", order.tax_amount], ["其他费用", order.other_amount], ["优惠", -Number(order.discount_amount)]].map(([label, amount]) => <div key={String(label)} className="flex justify-between"><Text size="small" className="text-ui-fg-subtle">{label}</Text><Text size="small">{formatAmount(Number(amount), order.currency_code)}</Text></div>)}<div className="border-t pt-3"><div className="flex justify-between"><Text weight="plus">总额 / Total</Text><Text weight="plus">{formatAmount(order.total_amount, order.currency_code)}</Text></div><div className="mt-2 flex justify-between"><Text size="small">待付款 / Outstanding</Text><Text size="small">{formatAmount(order.outstanding_amount, order.currency_code)}</Text></div></div></div></Container>
        <Container className="divide-y p-0"><div className="px-6 py-4"><Text weight="plus">交付信息 / Delivery</Text></div><div className="flex flex-col gap-3 px-6 py-4"><div><Text size="small" className="text-ui-fg-subtle">预计到货 / Expected</Text><Text size="small">{formatDate(order.expected_at)}</Text></div><div><Text size="small" className="text-ui-fg-subtle">实际收货 / Received</Text><Text size="small">{formatDate(order.received_at)}</Text></div><div><Text size="small" className="text-ui-fg-subtle">汇率快照 / Exchange rate</Text><Text size="small">1 {order.currency_code.toUpperCase()} = {Number(order.exchange_rate)} {order.base_currency_code.toUpperCase()}</Text></div></div></Container>
        <Container className="divide-y p-0"><div className="px-6 py-4"><Text weight="plus">操作记录 / Audit</Text></div><div className="flex flex-col gap-3 px-6 py-4">{order.audits.map((audit) => <div key={audit.id}><Text size="small" weight="plus">{audit.action}</Text><Text size="small" className="text-ui-fg-subtle">{formatDate(audit.created_at_event)}</Text></div>)}</div></Container>
      </div>
    </div>

    <FocusModal open={paymentOpen} onOpenChange={setPaymentOpen}><FocusModal.Content><div className="flex h-full flex-col"><FocusModal.Header><div className="flex w-full justify-end gap-2"><FocusModal.Close asChild><Button size="small" variant="secondary">取消</Button></FocusModal.Close><Button size="small" isLoading={paymentMutation.isPending} onClick={() => paymentMutation.mutate()}>保存付款 / Save</Button></div></FocusModal.Header><FocusModal.Body><div className="mx-auto flex max-w-xl flex-col gap-4 p-6"><Heading>记录付款</Heading><div className="flex flex-col gap-2"><Label>金额 / Amount</Label><Input type="number" min="0.0001" step="0.0001" value={payment.amount} onChange={(event) => setPayment({ ...payment, amount: Number(event.target.value) })} /></div><div className="flex flex-col gap-2"><Label>支付方式 / Method</Label><Input value={payment.payment_method} onChange={(event) => setPayment({ ...payment, payment_method: event.target.value })} /></div><div className="flex flex-col gap-2"><Label>交易流水号 / Reference</Label><Input value={payment.transaction_reference} onChange={(event) => setPayment({ ...payment, transaction_reference: event.target.value })} /></div><div className="flex flex-col gap-2"><Label>付款日期 / Paid at</Label><Input type="date" value={payment.paid_at} onChange={(event) => setPayment({ ...payment, paid_at: event.target.value })} /></div><div className="flex flex-col gap-2"><Label>备注 / Notes</Label><Textarea value={payment.notes} onChange={(event) => setPayment({ ...payment, notes: event.target.value })} /></div></div></FocusModal.Body></div></FocusModal.Content></FocusModal>

    <FocusModal open={receiptOpen} onOpenChange={setReceiptOpen}><FocusModal.Content><div className="flex h-full flex-col"><FocusModal.Header><div className="flex w-full justify-end gap-2"><FocusModal.Close asChild><Button size="small" variant="secondary">取消</Button></FocusModal.Close><Button size="small" isLoading={receiptMutation.isPending} onClick={() => receiptMutation.mutate()}>保存收货 / Save</Button></div></FocusModal.Header><FocusModal.Body className="overflow-y-auto"><div className="mx-auto flex max-w-3xl flex-col gap-4 p-6"><Heading>记录收货</Heading><div className="grid gap-4 sm:grid-cols-2"><div className="flex flex-col gap-2"><Label>仓库 / Warehouse</Label><Input value={receipt.warehouse_name} onChange={(event) => setReceipt({ ...receipt, warehouse_name: event.target.value })} /></div><div className="flex flex-col gap-2"><Label>收货日期 / Date</Label><Input type="date" value={receipt.received_at} onChange={(event) => setReceipt({ ...receipt, received_at: event.target.value })} /></div></div><Table><Table.Header><Table.Row><Table.HeaderCell>商品</Table.HeaderCell><Table.HeaderCell>待收</Table.HeaderCell><Table.HeaderCell>本次收货</Table.HeaderCell></Table.Row></Table.Header><Table.Body>{order.items.map((item) => { const remaining = item.quantity - item.received_quantity; return <Table.Row key={item.id}><Table.Cell>{item.product_title}</Table.Cell><Table.Cell>{remaining}</Table.Cell><Table.Cell><Input type="number" min="0" max={remaining} value={receipt.quantities[item.id] || 0} onChange={(event) => setReceipt({ ...receipt, quantities: { ...receipt.quantities, [item.id]: Number(event.target.value) } })} /></Table.Cell></Table.Row> })}</Table.Body></Table><div className="flex flex-col gap-2"><Label>备注 / Notes</Label><Textarea value={receipt.notes} onChange={(event) => setReceipt({ ...receipt, notes: event.target.value })} /></div></div></FocusModal.Body></div></FocusModal.Content></FocusModal>

    <Drawer open={editOpen} onOpenChange={setEditOpen}><Drawer.Content><Drawer.Header><Drawer.Title>编辑采购单 / Edit purchase order</Drawer.Title></Drawer.Header><Drawer.Body className="overflow-y-auto p-6">{editValue && <div className="flex flex-col gap-5"><div className="grid gap-4 sm:grid-cols-2"><div className="flex flex-col gap-2"><Label>供应商</Label><Select value={editValue.supplier_id} onValueChange={(supplier_id) => setEditValue({ ...editValue, supplier_id })}><Select.Trigger><Select.Value /></Select.Trigger><Select.Content>{(suppliers.data?.suppliers || []).map((supplier) => <Select.Item key={supplier.id} value={supplier.id}>{supplier.name}</Select.Item>)}</Select.Content></Select></div><div className="flex flex-col gap-2"><Label>币种</Label><Input maxLength={3} value={editValue.currency_code} onChange={(event) => setEditValue({ ...editValue, currency_code: event.target.value })} /></div><div className="flex flex-col gap-2"><Label>汇率</Label><Input type="number" step="0.0001" value={editValue.exchange_rate} onChange={(event) => setEditValue({ ...editValue, exchange_rate: Number(event.target.value) })} /></div><div className="flex flex-col gap-2"><Label>预计到货</Label><Input type="date" value={editValue.expected_at} onChange={(event) => setEditValue({ ...editValue, expected_at: event.target.value })} /></div></div>{editValue.items.map((item, index) => <div key={index} className="shadow-elevation-card-rest rounded-lg p-4"><div className="grid gap-3 sm:grid-cols-2"><div className="flex flex-col gap-2"><Label>商品</Label><Input value={item.product_title} onChange={(event) => updateEditItem(index, "product_title", event.target.value)} /></div><div className="flex flex-col gap-2"><Label>SKU</Label><Input value={item.sku} onChange={(event) => updateEditItem(index, "sku", event.target.value)} /></div><div className="flex flex-col gap-2"><Label>数量</Label><Input type="number" min="1" value={item.quantity} onChange={(event) => updateEditItem(index, "quantity", Number(event.target.value))} /></div><div className="flex flex-col gap-2"><Label>单位成本</Label><Input type="number" min="0" step="0.0001" value={item.unit_cost} onChange={(event) => updateEditItem(index, "unit_cost", Number(event.target.value))} /></div></div></div>)}<div className="flex flex-col gap-2"><Label>备注</Label><Textarea value={editValue.notes} onChange={(event) => setEditValue({ ...editValue, notes: event.target.value })} /></div></div>}</Drawer.Body><Drawer.Footer><Drawer.Close asChild><Button size="small" variant="secondary">取消</Button></Drawer.Close><Button size="small" isLoading={editMutation.isPending} onClick={() => editMutation.mutate()}>保存 / Save</Button></Drawer.Footer></Drawer.Content></Drawer>
  </div>
}

export default OrderDetailPage
