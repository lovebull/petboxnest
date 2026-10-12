import { Spinner } from "@medusajs/icons"
import { Container, Heading, Input, Table, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { ProcurementNav } from "../../../components/procurement-nav"
import { formatAmount } from "../../../lib/format"
import { sdk } from "../../../lib/sdk"
import type { ProcurementAnalytics } from "../../../types"

const AnalyticsPage = () => {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const analytics = useQuery({
    queryKey: ["procurement-analytics", dateFrom, dateTo],
    queryFn: () => sdk.client.fetch<ProcurementAnalytics>("/admin/procurement/analytics", { query: { date_from: dateFrom || undefined, date_to: dateTo || undefined } }),
  })
  const data = analytics.data
  const currency = data?.summary.base_currency_code || "usd"
  return <div className="flex flex-col gap-y-3">
    <Container className="p-0"><div className="px-6 py-5"><Heading>采购统计</Heading><Text size="small" className="text-ui-fg-subtle">Procurement analytics · 金额统一按采购时汇率快照换算</Text></div><div className="border-t px-6 py-4"><ProcurementNav /></div></Container>
    <Container className="p-0"><div className="grid gap-4 px-6 py-4 sm:grid-cols-2"><div><Text size="small" className="mb-2 text-ui-fg-subtle">开始日期 / From</Text><Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} /></div><div><Text size="small" className="mb-2 text-ui-fg-subtle">结束日期 / To</Text><Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} /></div></div></Container>
    {analytics.isLoading ? <Container><div className="flex justify-center p-16"><Spinner /></div></Container> : <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["采购总额 / Total", formatAmount(data?.summary.total_amount || 0, currency)], ["已付款 / Paid", formatAmount(data?.summary.paid_amount || 0, currency)], ["未付款 / Outstanding", formatAmount(data?.summary.outstanding_amount || 0, currency)], ["平均采购单 / Average", formatAmount(data?.summary.average_order_amount || 0, currency)]].map(([label, value]) => <Container key={label} className="px-6 py-4"><Text size="small" className="text-ui-fg-subtle">{label}</Text><Heading level="h2" className="mt-1">{value}</Heading></Container>)}</div>
      <div className="grid gap-3 lg:grid-cols-2">
        <Container className="divide-y p-0"><div className="px-6 py-4"><Text weight="plus">供应商采购排行 / Supplier ranking</Text></div><Table><Table.Header><Table.Row><Table.HeaderCell>供应商</Table.HeaderCell><Table.HeaderCell>采购单</Table.HeaderCell><Table.HeaderCell>金额 ({currency.toUpperCase()})</Table.HeaderCell></Table.Row></Table.Header><Table.Body>{(data?.supplier_totals || []).map((row) => <Table.Row key={row.supplier_id}><Table.Cell>{row.supplier_name}</Table.Cell><Table.Cell>{row.orders}</Table.Cell><Table.Cell>{formatAmount(row.total, currency)}</Table.Cell></Table.Row>)}</Table.Body></Table></Container>
        <Container className="divide-y p-0"><div className="px-6 py-4"><Text weight="plus">月度趋势 / Monthly totals</Text></div><Table><Table.Header><Table.Row><Table.HeaderCell>月份 / Month</Table.HeaderCell><Table.HeaderCell>金额 ({currency.toUpperCase()})</Table.HeaderCell></Table.Row></Table.Header><Table.Body>{(data?.monthly_totals || []).map((row) => <Table.Row key={row.month}><Table.Cell>{row.month}</Table.Cell><Table.Cell>{formatAmount(row.total, currency)}</Table.Cell></Table.Row>)}</Table.Body></Table></Container>
      </div>
      <Container className="divide-y p-0"><div className="px-6 py-4"><Text weight="plus">原始币种金额 / Original currency totals</Text></div><Table><Table.Header><Table.Row><Table.HeaderCell>币种 / Currency</Table.HeaderCell><Table.HeaderCell>金额 / Total</Table.HeaderCell></Table.Row></Table.Header><Table.Body>{(data?.currency_totals || []).map((row) => <Table.Row key={row.currency_code}><Table.Cell>{row.currency_code.toUpperCase()}</Table.Cell><Table.Cell>{formatAmount(row.total, row.currency_code)}</Table.Cell></Table.Row>)}</Table.Body></Table></Container>
    </>}
  </div>
}

export default AnalyticsPage
