import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ChatBubbleLeftRight } from "@medusajs/icons";
import {
  Badge,
  Button,
  Container,
  Drawer,
  Heading,
  Input,
  Select,
  Table,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { sdk } from "../../lib/sdk";

type ResolutionStatus = "open" | "resolved" | "ignored";
type Resource =
  | "cart"
  | "shipping_options"
  | "payment_providers"
  | "store_credit"
  | "route_render";

type CheckoutError = {
  id: string;
  error_id: string;
  resource: Resource;
  code: string;
  status_code: number | null;
  retryable: boolean;
  cart_id_hash: string | null;
  region_id: string | null;
  country_code: string | null;
  route_key: string | null;
  digest: string | null;
  source: string;
  occurred_at: string;
  resolution_status: ResolutionStatus;
  admin_note: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
};

type ListResponse = {
  errors: CheckoutError[];
  count: number;
  page: number;
  page_size: number;
  page_count: number;
  summary: { total: number; open: number; resolved: number; ignored: number };
};

const resourceLabels: Record<Resource, string> = {
  cart: "购物车 / Cart",
  shipping_options: "配送方式 / Shipping",
  payment_providers: "付款方式 / Payment",
  store_credit: "商店余额 / Store credit",
  route_render: "页面渲染 / Route render",
};
const statusLabels: Record<ResolutionStatus, string> = {
  open: "待处理 / Open",
  resolved: "已解决 / Resolved",
  ignored: "已忽略 / Ignored",
};
const statusColors = {
  open: "orange",
  resolved: "green",
  ignored: "grey",
} as const;

const CheckoutErrorsPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [resource, setResource] = useState("all");
  const [status, setStatus] = useState("all");
  const [retryable, setRetryable] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const list = useQuery({
    queryKey: [
      "checkout-errors",
      page,
      limit,
      query,
      resource,
      status,
      retryable,
      dateFrom,
      dateTo,
    ],
    queryFn: () =>
      sdk.client.fetch<ListResponse>("/admin/checkout-errors", {
        query: {
          page,
          limit,
          q: query || undefined,
          resource: resource === "all" ? undefined : resource,
          resolution_status: status === "all" ? undefined : status,
          retryable: retryable === "all" ? undefined : retryable,
          date_from: dateFrom
            ? new Date(`${dateFrom}T00:00:00.000Z`).toISOString()
            : undefined,
          date_to: dateTo
            ? new Date(`${dateTo}T23:59:59.999Z`).toISOString()
            : undefined,
        },
      }),
  });
  const detail = useQuery({
    queryKey: ["checkout-error", activeId],
    queryFn: () =>
      sdk.client.fetch<{ error: CheckoutError }>(
        `/admin/checkout-errors/${activeId}`,
      ),
    enabled: Boolean(activeId),
  });
  const update = useMutation({
    mutationFn: ({
      id,
      resolution_status,
      admin_note,
    }: {
      id: string;
      resolution_status: ResolutionStatus;
      admin_note?: string | null;
    }) =>
      sdk.client.fetch(`/admin/checkout-errors/${id}/status`, {
        method: "POST",
        body: { resolution_status, admin_note },
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["checkout-errors"] }),
        queryClient.invalidateQueries({ queryKey: ["checkout-error"] }),
      ]);
      toast.success("处理状态已更新");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const clearFilters = () => {
    setSearch("");
    setQuery("");
    setResource("all");
    setStatus("all");
    setRetryable("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };
  const rows = list.data?.errors || [];
  const hasFilters =
    query ||
    resource !== "all" ||
    status !== "all" ||
    retryable !== "all" ||
    dateFrom ||
    dateTo;

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="p-0">
        <div className="flex flex-col gap-4 border-b px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Heading level="h1">前台错误日志</Heading>
            <Text className="text-ui-fg-subtle" size="small">
              Storefront error logs · 查看脱敏的页面与结账错误并记录处理结果。
            </Text>
          </div>
          <div className="flex flex-wrap gap-2">
            <Stat label="全部 / Total" value={list.data?.summary.total} />
            <Stat label="待处理 / Open" value={list.data?.summary.open} />
            <Stat
              label="已解决 / Resolved"
              value={list.data?.summary.resolved}
            />
            <Stat label="已忽略 / Ignored" value={list.data?.summary.ignored} />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b px-6 py-4 lg:flex-row lg:flex-wrap">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜索错误编号、代码、路由或 digest"
            className="lg:max-w-sm"
          />
          <FilterSelect
            value={resource}
            onChange={(value) => {
              setResource(value);
              setPage(1);
            }}
            placeholder="全部资源"
            options={Object.entries(resourceLabels)}
          />
          <FilterSelect
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            placeholder="全部状态"
            options={Object.entries(statusLabels)}
          />
          <FilterSelect
            value={retryable}
            onChange={(value) => {
              setRetryable(value);
              setPage(1);
            }}
            placeholder="全部重试类型"
            options={[
              ["true", "可重试 / Retryable"],
              ["false", "不可重试 / Non-retryable"],
            ]}
          />
          <Input
            type="date"
            value={dateFrom}
            aria-label="开始日期"
            onChange={(event) => {
              setDateFrom(event.target.value);
              setPage(1);
            }}
            className="lg:w-40"
          />
          <Input
            type="date"
            value={dateTo}
            aria-label="结束日期"
            onChange={(event) => {
              setDateTo(event.target.value);
              setPage(1);
            }}
            className="lg:w-40"
          />
          {hasFilters && (
            <Button size="small" variant="secondary" onClick={clearFilters}>
              清除筛选
            </Button>
          )}
        </div>

        {list.isError ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <Heading level="h2">日志加载失败</Heading>
            <Text className="text-ui-fg-subtle">请检查 Backend 后重试。</Text>
            <Button size="small" onClick={() => list.refetch()}>
              重新加载
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>错误编号</Table.HeaderCell>
                  <Table.HeaderCell>资源</Table.HeaderCell>
                  <Table.HeaderCell>错误代码</Table.HeaderCell>
                  <Table.HeaderCell>重试</Table.HeaderCell>
                  <Table.HeaderCell>状态</Table.HeaderCell>
                  <Table.HeaderCell>发生时间</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {rows.map((record) => (
                  <Table.Row
                    key={record.id}
                    className="cursor-pointer"
                    onClick={() => setActiveId(record.id)}
                  >
                    <Table.Cell className="font-mono">
                      {record.error_id}
                    </Table.Cell>
                    <Table.Cell>{resourceLabels[record.resource]}</Table.Cell>
                    <Table.Cell>{record.code}</Table.Cell>
                    <Table.Cell>{record.retryable ? "是" : "否"}</Table.Cell>
                    <Table.Cell>
                      <Badge color={statusColors[record.resolution_status]}>
                        {statusLabels[record.resolution_status]}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      {new Date(record.occurred_at).toLocaleString()}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
            {list.isLoading && (
              <div className="px-6 py-16 text-center">
                <Text className="text-ui-fg-subtle">正在加载日志…</Text>
              </div>
            )}
            {!list.isLoading && rows.length === 0 && (
              <div className="px-6 py-16 text-center">
                <Text className="text-ui-fg-subtle">没有符合条件的日志</Text>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Text size="small">
            第 {page} 页，共 {list.data?.page_count || 1} 页 ·{" "}
            {list.data?.count || 0} 条
          </Text>
          <div className="flex items-center gap-2">
            <Select
              value={String(limit)}
              onValueChange={(value) => {
                setLimit(Number(value));
                setPage(1);
              }}
            >
              <Select.Trigger className="w-24">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {[20, 50, 100].map((size) => (
                  <Select.Item key={size} value={String(size)}>
                    {size} 条
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Button
              size="small"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              上一页
            </Button>
            <Button
              size="small"
              variant="secondary"
              disabled={page >= (list.data?.page_count || 1)}
              onClick={() => setPage((value) => value + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      </Container>

      <ErrorDrawer
        record={detail.data?.error || null}
        open={Boolean(activeId)}
        loading={detail.isLoading}
        onOpenChange={(open) => !open && setActiveId(null)}
        onUpdate={(resolution_status, admin_note) => {
          if (activeId)
            update.mutate({ id: activeId, resolution_status, admin_note });
        }}
        updating={update.isPending}
      />
    </div>
  );
};

function Stat({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-md bg-ui-bg-subtle px-3 py-2">
      <Text size="xsmall" className="text-ui-fg-subtle">
        {label}
      </Text>
      <Text weight="plus">{value ?? "—"}</Text>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: string[][];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <Select.Trigger className="lg:w-52">
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="all">{placeholder}</Select.Item>
        {options.map(([optionValue, label]) => (
          <Select.Item key={optionValue} value={optionValue}>
            {label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
}

function ErrorDrawer({
  record,
  open,
  loading,
  onOpenChange,
  onUpdate,
  updating,
}: {
  record: CheckoutError | null;
  open: boolean;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (status: ResolutionStatus, note: string | null) => void;
  updating: boolean;
}) {
  const [note, setNote] = useState("");
  useEffect(() => setNote(record?.admin_note || ""), [record?.admin_note]);
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>错误日志详情 / Error details</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-5 overflow-y-auto p-6">
          {loading && <Text className="text-ui-fg-subtle">正在加载…</Text>}
          {record && (
            <>
              <div>
                <Heading level="h2" className="font-mono">
                  {record.error_id}
                </Heading>
                <Text size="small" className="text-ui-fg-subtle">
                  {new Date(record.occurred_at).toLocaleString()}
                </Text>
              </div>
              <div className="grid grid-cols-2 gap-3 rounded-md bg-ui-bg-subtle p-4">
                <Detail label="资源" value={resourceLabels[record.resource]} />
                <Detail
                  label="状态码"
                  value={record.status_code?.toString() || "未提供"}
                />
                <Detail label="错误代码" value={record.code} />
                <Detail label="可重试" value={record.retryable ? "是" : "否"} />
                <Detail
                  label="购物车哈希"
                  value={record.cart_id_hash || "未提供"}
                />
                <Detail
                  label="Region ID"
                  value={record.region_id || "未提供"}
                />
                <Detail
                  label="国家"
                  value={record.country_code?.toUpperCase() || "未提供"}
                />
                <Detail label="路由范围" value={record.route_key || "未提供"} />
                <Detail
                  label="Next.js digest"
                  value={record.digest || "未提供"}
                />
                <Detail label="来源" value={record.source} />
              </div>
              <div className="flex flex-col gap-2">
                <Text weight="plus">管理员备注 / Admin note</Text>
                <Textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  maxLength={2000}
                  rows={6}
                  placeholder="记录排查原因或处理结果"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={updating}
                  onClick={() => onUpdate("resolved", note.trim() || null)}
                >
                  标记已解决
                </Button>
                <Button
                  disabled={updating}
                  variant="secondary"
                  onClick={() => onUpdate("open", note.trim() || null)}
                >
                  恢复待处理
                </Button>
                <Button
                  disabled={updating}
                  variant="secondary"
                  onClick={() => onUpdate("ignored", note.trim() || null)}
                >
                  忽略
                </Button>
              </div>
              {record.resolved_at && (
                <Text size="xsmall" className="text-ui-fg-subtle">
                  最后处理：{new Date(record.resolved_at).toLocaleString()}
                </Text>
              )}
            </>
          )}
        </Drawer.Body>
      </Drawer.Content>
    </Drawer>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Text size="xsmall" className="text-ui-fg-subtle">
        {label}
      </Text>
      <Text size="small" className="break-all">
        {value}
      </Text>
    </div>
  );
}

export const config = defineRouteConfig({
  label: "前台错误 / Storefront errors",
  icon: ChatBubbleLeftRight,
  rank: 60,
});

export default CheckoutErrorsPage;
