import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ChartBar, Spinner } from "@medusajs/icons";
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Select,
  Switch,
  Text,
  toast,
} from "@medusajs/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { sdk } from "../../lib/sdk";
import type {
  CommerceAnalyticsResponse,
  CommerceAnalyticsSummary,
  AnalyticsCollectionSettingsResponse,
} from "../../types";

const isoDay = (date: Date) => date.toISOString().slice(0, 10);
const businessDay = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value || "";
  return `${value("year")}-${value("month")}-${value("day")}`;
};
const todayRange = () => {
  const today = businessDay(new Date());
  return { from: today, to: today };
};

const formatAmount = (value: number, currencyCode: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(value || 0);

const changeFrom = (current: number, previous: number) => {
  if (!previous) return current ? null : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
};

const Change = ({
  current,
  previous,
}: {
  current: number;
  previous: number;
}) => {
  const change = changeFrom(current, previous);
  if (change === null) {
    return (
      <Text size="xsmall" className="text-ui-fg-muted">
        上期为 0 / No baseline
      </Text>
    );
  }
  const positive = change > 0;
  const negative = change < 0;
  return (
    <Text
      size="small"
      weight="plus"
      className={
        positive
          ? "text-ui-tag-green-text"
          : negative
            ? "text-ui-tag-red-text"
            : "text-ui-fg-muted"
      }
    >
      {positive ? "↑" : negative ? "↓" : ""} {Math.abs(change).toFixed(1)}%
    </Text>
  );
};

const LineChart = ({
  values,
  labels,
  label,
}: {
  values: number[];
  labels: string[];
  label: string;
}) => {
  const width = 480;
  const height = 150;
  const padding = 12;
  const normalized = values.length ? values : [0];
  const max = Math.max(...normalized, 1);
  const points = normalized.map((value, index) => {
    const x =
      normalized.length === 1
        ? width / 2
        : padding + (index / (normalized.length - 1)) * (width - padding * 2);
    const y = height - padding - (value / max) * (height - padding * 2);
    return `${x},${y}`;
  });
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-36 w-full"
      role="img"
      aria-label={label}
    >
      {[0, 1, 2, 3].map((line) => {
        const y = padding + (line / 3) * (height - padding * 2);
        return (
          <line
            key={line}
            x1={padding}
            x2={width - padding}
            y1={y}
            y2={y}
            className="stroke-ui-border-base"
          />
        );
      })}
      <polyline
        points={points.join(" ")}
        fill="none"
        className="stroke-ui-fg-interactive"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((point, index) => {
        const [x, y] = point.split(",").map(Number);
        return (
          <circle
            key={`${labels[index]}-${index}`}
            cx={x}
            cy={y}
            r="3"
            className="fill-ui-bg-base stroke-ui-fg-interactive"
            strokeWidth="2"
          >
            <title>
              {labels[index] || index}: {values[index] || 0}
            </title>
          </circle>
        );
      })}
      <text x={padding} y={height - 1} className="fill-ui-fg-muted text-[10px]">
        {labels[0]}
      </text>
      <text
        x={width - padding}
        y={height - 1}
        textAnchor="end"
        className="fill-ui-fg-muted text-[10px]"
      >
        {labels[labels.length - 1]}
      </text>
    </svg>
  );
};

const StackedChart = ({
  first,
  second,
}: {
  first: number[];
  second: number[];
}) => {
  const values = first.map((value, index) => value + (second[index] || 0));
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-36 items-end gap-1 border-b border-ui-border-base px-2 pt-4">
      {values.length ? (
        values.map((total, index) => {
          const firstHeight = ((first[index] || 0) / max) * 100;
          const secondHeight = ((second[index] || 0) / max) * 100;
          return (
            <div
              key={index}
              className="flex h-full min-w-1 flex-1 flex-col justify-end"
              title={`New ${first[index] || 0}, Returning ${second[index] || 0}`}
            >
              <div
                className="bg-ui-tag-purple-icon"
                style={{ height: `${secondHeight}%` }}
              />
              <div
                className="bg-ui-fg-interactive"
                style={{ height: `${firstHeight}%` }}
              />
            </div>
          );
        })
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Text size="small" className="text-ui-fg-muted">
            暂无访问数据 / No traffic data
          </Text>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({
  title,
  subtitle,
  value,
  current,
  previous,
  children,
}: {
  title: string;
  subtitle: string;
  value: string;
  current: number;
  previous: number;
  children: React.ReactNode;
}) => (
  <Container className="flex min-h-[330px] flex-col p-0">
    <div className="flex items-start justify-between gap-4 px-5 py-4">
      <div>
        <Heading level="h2">{title}</Heading>
        <Text size="xsmall" className="text-ui-fg-subtle">
          {subtitle}
        </Text>
      </div>
      <Change current={current} previous={previous} />
    </div>
    <div className="px-5 pb-2">
      <Heading level="h1">{value}</Heading>
    </div>
    <div className="mt-auto border-t px-4 py-3">{children}</div>
  </Container>
);

const Funnel = ({ summary }: { summary: CommerceAnalyticsSummary }) => {
  const rows = [
    ["访问 / Visits", summary.visits, 100],
    [
      "加入购物车 / Added to cart",
      summary.added_to_cart_sessions,
      summary.add_to_cart_rate,
    ],
    ["进入结账 / Checkout", summary.checkout_sessions, summary.checkout_rate],
    [
      "成功下单 / Converted",
      summary.completed_sessions,
      summary.conversion_rate,
    ],
  ] as const;
  return (
    <div className="space-y-3 py-2">
      {rows.map(([label, count, rate]) => (
        <div key={label}>
          <div className="mb-1 flex justify-between gap-4">
            <Text size="small">{label}</Text>
            <Text size="small" weight="plus">
              {count} · {rate.toFixed(1)}%
            </Text>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-ui-bg-subtle">
            <div
              className="h-full rounded-full bg-ui-fg-interactive"
              style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const CommerceAnalyticsPage = () => {
  const queryClient = useQueryClient();
  const initial = useMemo(todayRange, []);
  const [dateFrom, setDateFrom] = useState(initial.from);
  const [dateTo, setDateTo] = useState(initial.to);
  const [currencyCode, setCurrencyCode] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);

  const analytics = useQuery({
    queryKey: ["commerce-analytics", dateFrom, dateTo, currencyCode],
    queryFn: () =>
      sdk.client.fetch<CommerceAnalyticsResponse>("/admin/commerce-analytics", {
        query: {
          date_from: dateFrom,
          date_to: dateTo,
          currency_code: currencyCode || undefined,
          granularity: "auto",
        },
      }),
    refetchInterval: autoRefresh ? 60_000 : false,
  });

  const collectionSettings = useQuery({
    queryKey: ["commerce-analytics", "collection-settings"],
    queryFn: () =>
      sdk.client.fetch<AnalyticsCollectionSettingsResponse>(
        "/admin/commerce-analytics/settings",
      ),
  });

  const updateCollectionSettings = useMutation({
    mutationFn: (collectBeforeConsent: boolean) =>
      sdk.client.fetch<AnalyticsCollectionSettingsResponse>(
        "/admin/commerce-analytics/settings",
        {
          method: "POST",
          body: { require_cookie_consent: !collectBeforeConsent },
        },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["commerce-analytics", "collection-settings"],
      });
      toast.success("采集设置已保存 / Collection settings saved");
    },
    onError: (error: Error) =>
      toast.error(`保存失败 / Save failed: ${error.message}`),
  });

  const activeCurrency = analytics.data?.currency_code || currencyCode || "usd";
  const summary = analytics.data?.summary;
  const previous = analytics.data?.previous_summary;
  const series = analytics.data?.series || [];
  const collectBeforeConsent =
    collectionSettings.data?.settings.collect_before_consent ?? false;

  const selectPreset = (days: number, offset = 0) => {
    const end = new Date(`${businessDay(new Date())}T00:00:00.000Z`);
    end.setUTCDate(end.getUTCDate() - offset);
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - days + 1);
    setDateFrom(isoDay(start));
    setDateTo(isoDay(end));
  };

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="p-0">
        <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
          <div>
            <Heading>经营概览</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Commerce Overview · 销售、访问与转化漏斗
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <Button size="small" variant="secondary" asChild>
              <Link to="/sales-analytics">查看销售明细 / Sales report</Link>
            </Button>
            <Badge color={autoRefresh ? "green" : "grey"}>
              {autoRefresh ? "每 60 秒刷新" : "自动刷新已关闭"}
            </Badge>
            <Button
              size="small"
              variant="secondary"
              onClick={() => setAutoRefresh((value) => !value)}
            >
              {autoRefresh ? "关闭自动刷新" : "开启自动刷新"}
            </Button>
            <Button
              size="small"
              variant="secondary"
              onClick={() => analytics.refetch()}
            >
              刷新
            </Button>
          </div>
        </div>
        <div className="grid gap-3 border-t px-6 py-4 lg:grid-cols-[1fr_1fr_180px_auto]">
          <Input
            type="date"
            value={dateFrom}
            max={dateTo}
            onChange={(event) => setDateFrom(event.target.value)}
          />
          <Input
            type="date"
            value={dateTo}
            min={dateFrom}
            onChange={(event) => setDateTo(event.target.value)}
          />
          <Select value={activeCurrency} onValueChange={setCurrencyCode}>
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {(analytics.data?.available_currencies.length
                ? analytics.data.available_currencies
                : [activeCurrency]
              ).map((currency) => (
                <Select.Item key={currency} value={currency}>
                  {currency.toUpperCase()}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <div className="flex flex-wrap gap-2">
            <Button
              size="small"
              variant="secondary"
              onClick={() => selectPreset(1)}
            >
              今天
            </Button>
            <Button
              size="small"
              variant="secondary"
              onClick={() => selectPreset(1, 1)}
            >
              昨天
            </Button>
            <Button
              size="small"
              variant="secondary"
              onClick={() => selectPreset(7)}
            >
              7 天
            </Button>
            <Button
              size="small"
              variant="secondary"
              onClick={() => selectPreset(30)}
            >
              30 天
            </Button>
          </div>
        </div>
      </Container>

      <Container className="p-0">
        <div className="flex flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Heading level="h2">访客数据采集</Heading>
              <Badge color={collectBeforeConsent ? "orange" : "green"}>
                {collectBeforeConsent
                  ? "同意前采集 / Pre-consent"
                  : "需先同意 / Consent required"}
              </Badge>
            </div>
            <Text
              size="small"
              leading="compact"
              className="mt-1 text-ui-fg-subtle"
            >
              开启后，访客尚未选择 Cookie
              偏好时即可采集匿名访问与转化事件；访客明确选择“仅必要
              Cookie”后仍会停止采集。
            </Text>
            <Text size="small" leading="compact" className="text-ui-fg-muted">
              When enabled, anonymous analytics starts before a visitor makes a
              cookie choice. An explicit opt-out is always respected.
            </Text>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div>
              <Text size="small" weight="plus">
                无需事先同意，先采集
              </Text>
              <Text size="xsmall" className="text-ui-fg-subtle">
                Collect before consent
              </Text>
            </div>
            {collectionSettings.isLoading ? (
              <Spinner />
            ) : (
              <Switch
                checked={collectBeforeConsent}
                disabled={
                  collectionSettings.isError ||
                  updateCollectionSettings.isPending
                }
                onCheckedChange={(checked) =>
                  updateCollectionSettings.mutate(checked)
                }
                aria-label="无需事先同意，先采集访客分析数据"
              />
            )}
          </div>
        </div>
        {collectionSettings.isError && (
          <div className="border-t px-6 py-3">
            <Text size="small" className="text-ui-fg-error">
              采集设置加载失败，Storefront 将使用默认的“需先同意”模式。
            </Text>
          </div>
        )}
      </Container>

      {analytics.isLoading ? (
        <Container className="flex justify-center p-16">
          <Spinner />
        </Container>
      ) : analytics.isError || !summary || !previous ? (
        <Container className="px-6 py-12">
          <Heading level="h2">经营数据加载失败</Heading>
          <Text className="text-ui-fg-subtle">
            Commerce analytics could not be loaded.
          </Text>
        </Container>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            title="总销售额"
            subtitle="Total sales"
            value={formatAmount(summary.total_sales, activeCurrency)}
            current={summary.total_sales}
            previous={previous.total_sales}
          >
            <LineChart
              values={series.map((point) => point.total_sales)}
              labels={series.map((point) => point.bucket)}
              label="总销售额随时间变化"
            />
          </MetricCard>

          <MetricCard
            title="访问量"
            subtitle="Visits · 30 分钟无操作后创建新会话"
            value={String(summary.visits)}
            current={summary.visits}
            previous={previous.visits}
          >
            <LineChart
              values={series.map((point) => point.visits)}
              labels={series.map((point) => point.bucket)}
              label="访问量随时间变化"
            />
          </MetricCard>

          <MetricCard
            title="回头客率"
            subtitle="Returning customer rate"
            value={`${summary.returning_customer_rate.toFixed(1)}%`}
            current={summary.returning_customer_rate}
            previous={previous.returning_customer_rate}
          >
            <StackedChart
              first={series.map((point) => point.new_customers)}
              second={series.map((point) => point.returning_customers)}
            />
            <div className="mt-2 flex justify-end gap-4">
              <Text size="xsmall" className="text-ui-fg-subtle">
                ● 新客户 / New
              </Text>
              <Text size="xsmall" className="text-ui-fg-subtle">
                ● 回头客 / Returning
              </Text>
            </div>
          </MetricCard>

          <MetricCard
            title="转化率"
            subtitle="Conversion funnel"
            value={`${summary.conversion_rate.toFixed(1)}%`}
            current={summary.conversion_rate}
            previous={previous.conversion_rate}
          >
            <Funnel summary={summary} />
          </MetricCard>

          <MetricCard
            title="平均订单金额"
            subtitle="Average order value"
            value={formatAmount(summary.average_order_value, activeCurrency)}
            current={summary.average_order_value}
            previous={previous.average_order_value}
          >
            <LineChart
              values={series.map((point) =>
                point.order_count ? point.total_sales / point.order_count : 0,
              )}
              labels={series.map((point) => point.bucket)}
              label="平均订单金额随时间变化"
            />
          </MetricCard>

          <MetricCard
            title="总订单数"
            subtitle="Total orders"
            value={String(summary.order_count)}
            current={summary.order_count}
            previous={previous.order_count}
          >
            <LineChart
              values={series.map((point) => point.order_count)}
              labels={series.map((point) => point.bucket)}
              label="订单数量随时间变化"
            />
          </MetricCard>
        </div>
      )}

      <Container className="px-6 py-4">
        <Text size="small" className="text-ui-fg-subtle">
          对比区间：{analytics.data?.period.previous_date_from || "—"} 至{" "}
          {analytics.data?.period.previous_date_to || "—"}。访问与漏斗数据当前
          {collectBeforeConsent
            ? "可在访客选择 Cookie 前采集，明确拒绝后停止"
            : "仅在访客同意 Analytics Cookie 后采集"}
          ；不同币种不会合并统计。
        </Text>
        <Text size="small" className="mt-1 text-ui-fg-muted">
          统计时区：{analytics.data?.period.timezone || "America/New_York"}
          ；销售额仅统计已收款及后续退款状态订单。所有图表包含无数据时段的零值。
        </Text>
      </Container>
    </div>
  );
};

export const config = defineRouteConfig({
  label: "经营概览 / Overview",
  icon: ChartBar,
  rank: 14,
});

export default CommerceAnalyticsPage;
