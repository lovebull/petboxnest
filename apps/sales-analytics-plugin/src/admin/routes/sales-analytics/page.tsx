import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChartBar, Spinner } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Select,
  Table,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { sdk } from "../../lib/sdk"
import type {
  SalesAnalyticsResponse,
  SalesOrdersResponse,
  SalesSummary,
} from "../../types"

const isoDay = (date: Date) => date.toISOString().slice(0, 10)
const initialRange = () => {
  const end = new Date()
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - 29)
  return { from: isoDay(start), to: isoDay(end) }
}

const amount = (value: number | string, currencyCode: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(Number(value || 0))

const percentChange = (current: number, previous: number) => {
  if (!previous) return current ? null : 0
  return ((current - previous) / Math.abs(previous)) * 100
}

const MetricCard = ({
  label,
  value,
  previous,
}: {
  label: string
  value: string
  previous?: { current: number; previous: number }
}) => {
  const change = previous
    ? percentChange(previous.current, previous.previous)
    : undefined
  return (
    <Container className="px-6 py-4">
      <Text size="small" leading="compact" className="text-ui-fg-subtle">
        {label}
      </Text>
      <Heading level="h2" className="mt-1">
        {value}
      </Heading>
      {change === null ? (
        <Text size="xsmall" className="mt-1 text-ui-fg-muted">上期为 0 / No prior baseline</Text>
      ) : change !== undefined ? (
        <Text
          size="xsmall"
          className={`mt-1 ${change > 0 ? "text-ui-tag-green-text" : change < 0 ? "text-ui-tag-red-text" : "text-ui-fg-muted"}`}
        >
          {change > 0 ? "+" : ""}{change.toFixed(1)}% 对比上期 / vs prior
        </Text>
      ) : null}
    </Container>
  )
}

const SalesChart = ({
  series,
  currencyCode,
  metric,
}: {
  series: SalesAnalyticsResponse["series"]
  currencyCode: string
  metric: "total_sales" | "gross_sales" | "net_sales"
}) => {
  const width = 900
  const height = 260
  const padding = 34
  const values = series.map((point) => Number(point[metric] || 0))
  const max = Math.max(...values, 1)
  const points = series.map((point, index) => {
    const x = series.length <= 1
      ? width / 2
      : padding + (index / (series.length - 1)) * (width - padding * 2)
    const y = height - padding - (Number(point[metric] || 0) / max) * (height - padding * 2)
    return { ...point, x, y }
  })
  if (!series.length) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Text size="small" className="text-ui-fg-subtle">此时间范围暂无销售数据 / No sales in this period</Text>
      </div>
    )
  }
  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-64 min-w-[680px] w-full"
        role="img"
        aria-label="总销售额随时间变化 / Total sales over time"
      >
        {[0, 1, 2, 3, 4].map((line) => {
          const y = padding + (line / 4) * (height - padding * 2)
          return <line key={line} x1={padding} x2={width - padding} y1={y} y2={y} className="stroke-ui-border-base" strokeWidth="1" />
        })}
        <polyline
          fill="none"
          className="stroke-ui-fg-interactive"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points.map((point) => `${point.x},${point.y}`).join(" ")}
        />
        {points.map((point) => (
          <g key={point.date}>
            <circle cx={point.x} cy={point.y} r="4" className="fill-ui-bg-base stroke-ui-fg-interactive" strokeWidth="2">
              <title>{point.date}: {amount(point[metric], currencyCode)}</title>
            </circle>
          </g>
        ))}
        <text x={padding} y={height - 8} className="fill-ui-fg-muted text-[11px]">{series[0]?.date}</text>
        <text x={width - padding} y={height - 8} textAnchor="end" className="fill-ui-fg-muted text-[11px]">{series[series.length - 1]?.date}</text>
      </svg>
    </div>
  )
}

const SalesAnalyticsPage = () => {
  const initial = useMemo(initialRange, [])
  const [dateFrom, setDateFrom] = useState(initial.from)
  const [dateTo, setDateTo] = useState(initial.to)
  const [currencyCode, setCurrencyCode] = useState("")
  const [metric, setMetric] = useState<"total_sales" | "gross_sales" | "net_sales">("total_sales")
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const analytics = useQuery({
    queryKey: ["sales-analytics", dateFrom, dateTo, currencyCode],
    queryFn: () => sdk.client.fetch<SalesAnalyticsResponse>("/admin/sales-analytics", {
      query: { date_from: dateFrom, date_to: dateTo, currency_code: currencyCode || undefined },
    }),
  })
  const activeCurrency = analytics.data?.currency_code || currencyCode || "usd"
  const orders = useQuery({
    queryKey: ["sales-analytics-orders", dateFrom, dateTo, activeCurrency, page],
    queryFn: () => sdk.client.fetch<SalesOrdersResponse>("/admin/sales-analytics/orders", {
      query: { date_from: dateFrom, date_to: dateTo, currency_code: activeCurrency, page, limit: 20 },
    }),
  })
  const rebuild = useMutation({
    mutationFn: () => sdk.client.fetch<{ processed_count: number }>("/admin/sales-analytics/rebuild", { method: "POST" }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["sales-analytics"] })
      queryClient.invalidateQueries({ queryKey: ["sales-analytics-orders"] })
      toast.success(`销售数据已重建，共处理 ${result.processed_count} 个订单`)
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "销售数据重建失败"),
  })

  const setPreset = (days: number) => {
    const end = new Date()
    const start = new Date(end)
    start.setUTCDate(start.getUTCDate() - days + 1)
    setDateFrom(isoDay(start))
    setDateTo(isoDay(end))
    setPage(1)
  }
  const summary = analytics.data?.summary
  const previous = analytics.data?.previous_summary
  const compare = (field: keyof SalesSummary) => ({
    current: Number(summary?.[field] || 0),
    previous: Number(previous?.[field] || 0),
  })

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div>
            <Heading>销售分析</Heading>
            <Text size="small" className="text-ui-fg-subtle">Sales Analytics · 销售、客户、退款和发货趋势</Text>
          </div>
          <Button size="small" variant="secondary" isLoading={rebuild.isPending} onClick={() => rebuild.mutate()}>
            重建历史数据 / Rebuild
          </Button>
        </div>
        <div className="grid gap-3 border-t px-6 py-4 md:grid-cols-[1fr_1fr_180px_auto]">
          <Input type="date" value={dateFrom} max={dateTo} onChange={(event) => { setDateFrom(event.target.value); setPage(1) }} />
          <Input type="date" value={dateTo} min={dateFrom} onChange={(event) => { setDateTo(event.target.value); setPage(1) }} />
          <Select value={activeCurrency} onValueChange={(value) => { setCurrencyCode(value); setPage(1) }}>
            <Select.Trigger><Select.Value /></Select.Trigger>
            <Select.Content>
              {(analytics.data?.available_currencies.length ? analytics.data.available_currencies : [activeCurrency]).map((currency) => (
                <Select.Item key={currency} value={currency}>{currency.toUpperCase()}</Select.Item>
              ))}
            </Select.Content>
          </Select>
          <div className="flex flex-wrap gap-2">
            {[7, 30, 90].map((days) => <Button key={days} size="small" variant="secondary" onClick={() => setPreset(days)}>{days} 天</Button>)}
          </div>
        </div>
      </Container>

      {analytics.isLoading ? (
        <Container className="flex justify-center p-16"><Spinner /></Container>
      ) : analytics.isError ? (
        <Container className="px-6 py-10"><Heading level="h2">销售数据加载失败</Heading><Text className="text-ui-fg-subtle">Sales analytics could not be loaded.</Text></Container>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="总销售额 / Total sales" value={amount(summary?.total_sales || 0, activeCurrency)} previous={compare("total_sales")} />
            <MetricCard label="毛销售额 / Gross sales" value={amount(summary?.gross_sales || 0, activeCurrency)} previous={compare("gross_sales")} />
            <MetricCard label="净销售额 / Net sales" value={amount(summary?.net_sales || 0, activeCurrency)} previous={compare("net_sales")} />
            <MetricCard label="订单 / Orders" value={String(summary?.order_count || 0)} previous={compare("order_count")} />
            <MetricCard label="售出件数 / Units sold" value={String(summary?.units_sold || 0)} previous={compare("units_sold")} />
            <MetricCard label="平均订单额 / AOV" value={amount(summary?.average_order_value || 0, activeCurrency)} previous={compare("average_order_value")} />
            <MetricCard label="回头客率 / Returning rate" value={`${Number(summary?.returning_customer_rate || 0).toFixed(1)}%`} previous={compare("returning_customer_rate")} />
            <MetricCard label="已发货订单 / Shipped" value={String(summary?.fully_shipped_orders || 0)} previous={compare("fully_shipped_orders")} />
          </div>

          <Container className="p-0">
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
              <div><Heading level="h2">销售额趋势</Heading><Text size="small" className="text-ui-fg-subtle">Sales over time · {analytics.data?.period.date_from} — {analytics.data?.period.date_to}</Text></div>
              <Select value={metric} onValueChange={(value) => setMetric(value as typeof metric)}>
                <Select.Trigger className="w-48"><Select.Value /></Select.Trigger>
                <Select.Content>
                  <Select.Item value="total_sales">总销售额 / Total</Select.Item>
                  <Select.Item value="gross_sales">毛销售额 / Gross</Select.Item>
                  <Select.Item value="net_sales">净销售额 / Net</Select.Item>
                </Select.Content>
              </Select>
            </div>
            <div className="border-t px-6 py-4"><SalesChart series={analytics.data?.series || []} currencyCode={activeCurrency} metric={metric} /></div>
          </Container>

          <div className="grid gap-3 md:grid-cols-3">
            <MetricCard label="折扣 / Discounts" value={amount(summary?.discounts || 0, activeCurrency)} />
            <MetricCard label="退款 / Refunds" value={amount(summary?.refunds || 0, activeCurrency)} />
            <MetricCard label="部分发货 / Partially shipped" value={String(summary?.partially_shipped_orders || 0)} />
          </div>
        </>
      )}

      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div><Heading level="h2">订单明细</Heading><Text size="small" className="text-ui-fg-subtle">Order facts · 点击订单号进入订单详情</Text></div>
          {analytics.data?.sync_state && (
            <Badge color={analytics.data.sync_state.status === "completed" ? "green" : analytics.data.sync_state.status === "failed" ? "red" : "orange"}>
              同步 {analytics.data.sync_state.status}
            </Badge>
          )}
        </div>
        {orders.isLoading ? <div className="flex justify-center p-12"><Spinner /></div> : (
          <Table>
            <Table.Header><Table.Row><Table.HeaderCell>订单 / Order</Table.HeaderCell><Table.HeaderCell>日期 / Date</Table.HeaderCell><Table.HeaderCell>总销售额 / Sales</Table.HeaderCell><Table.HeaderCell>退款 / Refund</Table.HeaderCell><Table.HeaderCell>件数 / Units</Table.HeaderCell><Table.HeaderCell>发货 / Fulfillment</Table.HeaderCell><Table.HeaderCell>客户 / Customer</Table.HeaderCell></Table.Row></Table.Header>
            <Table.Body>
              {(orders.data?.orders || []).map((order) => (
                <Table.Row key={order.id}>
                  <Table.Cell><Link className="text-ui-fg-interactive hover:underline" to={`/orders/${order.order_id}`}>#{order.display_id}</Link></Table.Cell>
                  <Table.Cell>{order.order_day}</Table.Cell>
                  <Table.Cell>{amount(order.total_sales, order.currency_code)}</Table.Cell>
                  <Table.Cell>{amount(order.refunds, order.currency_code)}</Table.Cell>
                  <Table.Cell>{order.units_sold}</Table.Cell>
                  <Table.Cell><Badge color={order.fulfillment_status === "fulfilled" || order.fulfillment_status === "delivered" ? "green" : order.fulfillment_status === "partially_fulfilled" ? "orange" : "grey"}>{order.fulfillment_status || "not_fulfilled"}</Badge></Table.Cell>
                  <Table.Cell>{order.is_returning_customer ? "回头客 / Returning" : "新客 / New"}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
        {!orders.isLoading && !orders.data?.orders.length && <div className="px-6 py-12 text-center"><Text className="text-ui-fg-subtle">暂无订单数据 / No order data</Text></div>}
        <div className="flex items-center justify-between px-6 py-4">
          <Text size="small">共 {orders.data?.count || 0} 条</Text>
          <div className="flex items-center gap-2"><Button size="small" variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>上一页</Button><Text size="small">{page} / {orders.data?.page_count || 1}</Text><Button size="small" variant="secondary" disabled={page >= (orders.data?.page_count || 1)} onClick={() => setPage((value) => value + 1)}>下一页</Button></div>
        </div>
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "销售分析 / Sales",
  icon: ChartBar,
  rank: 15,
})

export default SalesAnalyticsPage
