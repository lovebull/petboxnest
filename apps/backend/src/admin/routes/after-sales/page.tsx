import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ArrowPath, ShoppingBag } from "@medusajs/icons";
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
import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { sdk } from "../../lib/sdk";

type Request = {
  id: string;
  request_number: string;
  order_id: string;
  customer_email: string;
  type: string;
  status: string;
  reason_code: string;
  reason_text?: string | null;
  customer_note?: string | null;
  customer_message?: string | null;
  admin_note?: string | null;
  resolution?: string | null;
  refund_amount?: number | string | null;
  currency_code: string;
  created_at: string;
  items?: Array<any>;
  attachments?: Array<any>;
  history?: Array<any>;
};
type ListResponse = {
  requests: Request[];
  count: number;
  page: number;
  page_count: number;
  page_size: number;
};
const typeLabel: Record<string, string> = {
  cancel: "取消订单",
  return: "退货",
  exchange: "换货",
  damaged_claim: "破损/缺件理赔",
  lost_claim: "丢件理赔",
};
const statusLabel: Record<string, string> = {
  pending_review: "待审核",
  approved: "已批准",
  rejected: "已拒绝",
  awaiting_shipment: "等待寄回",
  in_transit: "运输中",
  received: "已收到",
  processing_refund: "退款处理中",
  refunded: "已退款",
  replacement_processing: "补发处理中",
  completed: "已完成",
  cancelled: "已取消",
};
const allowedTransitions: Record<string, string[]> = {
  pending_review: ["approved", "rejected", "cancelled"],
  approved: ["awaiting_shipment", "processing_refund", "replacement_processing", "completed", "cancelled"],
  awaiting_shipment: ["in_transit", "received", "cancelled"],
  in_transit: ["received"],
  received: ["processing_refund", "replacement_processing", "completed"],
  processing_refund: ["refunded"],
  refunded: ["completed"],
  replacement_processing: ["completed"],
};

const AfterSalesPage = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  const list = useQuery({
    queryKey: ["after-sales", page, status, type, query],
    queryFn: () =>
      sdk.client.fetch<ListResponse>("/admin/after-sales", {
        query: {
          page,
          limit: 20,
          status: status === "all" ? undefined : status,
          type: type === "all" ? undefined : type,
          q: query || undefined,
        },
      }),
  });
  const detail = useQuery({
    queryKey: ["after-sales-detail", activeId],
    queryFn: () =>
      sdk.client.fetch<{ request: Request; order: any }>(
        `/admin/after-sales/${activeId}`,
      ),
    enabled: Boolean(activeId),
  });
  return (
    <div className="flex flex-col gap-y-3">
      <Container className="p-0">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <Heading level="h1">售后服务</Heading>
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              审核取消、退换货与配送理赔申请。
            </Text>
          </div>
          <Button
            size="small"
            variant="secondary"
            onClick={() => list.refetch()}
            isLoading={list.isFetching}
          >
            <ArrowPath />
            刷新
          </Button>
        </div>
        <div className="flex flex-col gap-2 border-b px-6 py-4 md:flex-row">
          <Input
            placeholder="搜索申请号、订单 ID 或邮箱"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select
            value={type}
            onValueChange={(value) => {
              setType(value);
              setPage(1);
            }}
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">全部类型</Select.Item>
              {Object.entries(typeLabel).map(([value, label]) => (
                <Select.Item key={value} value={value}>
                  {label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">全部状态</Select.Item>
              {Object.entries(statusLabel).map(([value, label]) => (
                <Select.Item key={value} value={value}>
                  {label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>申请</Table.HeaderCell>
                <Table.HeaderCell>客户</Table.HeaderCell>
                <Table.HeaderCell>类型</Table.HeaderCell>
                <Table.HeaderCell>状态</Table.HeaderCell>
                <Table.HeaderCell>金额</Table.HeaderCell>
                <Table.HeaderCell>提交时间</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {list.data?.requests.map((request) => (
                <Table.Row
                  key={request.id}
                  className="cursor-pointer"
                  onClick={() => setActiveId(request.id)}
                >
                  <Table.Cell>
                    <Text size="small" weight="plus">
                      {request.request_number}
                    </Text>
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      {request.order_id}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="small">{request.customer_email}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="small">{typeLabel[request.type]}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      color={
                        request.status === "pending_review"
                          ? "orange"
                          : request.status === "rejected"
                            ? "red"
                            : request.status === "completed"
                              ? "green"
                              : "blue"
                      }
                    >
                      {statusLabel[request.status] || request.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="small">
                      {request.refund_amount ?? "—"}{" "}
                      {request.currency_code?.toUpperCase()}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="small">
                      {new Date(request.created_at).toLocaleString()}
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          {list.isLoading && (
            <div className="px-6 py-12 text-center">
              <Text size="small" className="text-ui-fg-subtle">
                正在加载售后申请…
              </Text>
            </div>
          )}
          {!list.isLoading && !list.data?.requests.length && (
            <div className="px-6 py-12 text-center">
              <Text size="small" className="text-ui-fg-subtle">
                暂无符合条件的申请
              </Text>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between border-t px-6 py-4">
          <Text size="small">
            共 {list.data?.count || 0} 条 · 第 {page}/
            {list.data?.page_count || 1} 页
          </Text>
          <div className="flex gap-2">
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
      <RequestDrawer
        open={Boolean(activeId)}
        onOpenChange={(open) => !open && setActiveId(null)}
        data={detail.data}
        loading={detail.isLoading}
      />
    </div>
  );
};

function RequestDrawer({
  open,
  onOpenChange,
  data,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: { request: Request; order: any };
  loading: boolean;
}) {
  const client = useQueryClient();
  const [nextStatus, setNextStatus] = useState("approved");
  const [resolution, setResolution] = useState("no_action");
  const [note, setNote] = useState("");
  const [customerMessage, setCustomerMessage] = useState("");
  const [reference, setReference] = useState("");
  const request = data?.request;
  const availableStatuses = request ? allowedTransitions[request.status] || [] : [];
  useEffect(() => {
    if (!request) return;
    setNextStatus(allowedTransitions[request.status]?.[0] || "");
    setResolution(request.resolution || "no_action");
    setNote("");
    setCustomerMessage(request.customer_message || "");
    setReference("");
  }, [request?.id, request?.status]);
  const mutation = useMutation({
    mutationFn: () =>
      sdk.client.fetch(`/admin/after-sales/${request!.id}/status`, {
        method: "POST",
        body: {
          status: nextStatus,
          admin_note: note || null,
          customer_message: customerMessage || null,
          resolution: resolution || null,
          ...(request?.type === "return"
            ? { medusa_return_id: reference || null }
            : request?.type === "exchange"
              ? { medusa_exchange_id: reference || null }
              : request?.type?.includes("claim")
                ? { medusa_claim_id: reference || null }
                : {}),
        },
      }),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ["after-sales"] }),
        client.invalidateQueries({ queryKey: ["after-sales-detail"] }),
      ]);
      toast.success("售后状态已更新");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (nextStatus === "rejected" && !note.trim())
      return toast.error("拒绝申请时必须填写原因");
    if (nextStatus === "processing_refund" && !["partial_refund", "full_refund"].includes(resolution))
      return toast.error("进入退款处理中前，请选择部分退款或全额退款");
    if (window.confirm(`确认将状态更新为“${statusLabel[nextStatus]}”？`))
      mutation.mutate();
  };
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>售后申请详情</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-y-5 overflow-y-auto p-6">
          {loading && (
            <Text size="small" className="text-ui-fg-subtle">
              正在加载…
            </Text>
          )}
          {request && (
            <>
              <div>
                <Text size="small" weight="plus">
                  {request.request_number}
                </Text>
                <Text size="small" className="text-ui-fg-subtle">
                  订单 #{data?.order?.display_id} · {request.customer_email}
                </Text>
                <Button
                  asChild
                  size="small"
                  variant="secondary"
                  className="mt-2"
                >
                  <Link to={`/orders/${request.order_id}`}>
                    打开 Medusa 订单处理页
                  </Link>
                </Button>
                {request.type === "return" && (
                  <Button asChild size="small" variant="secondary" className="ml-2 mt-2">
                    <Link to={`/orders/${request.order_id}/returns`}>
                      创建 Medusa 原生退货
                    </Link>
                  </Button>
                )}
                {request.type.includes("claim") && (
                  <Button asChild size="small" variant="secondary" className="ml-2 mt-2">
                    <Link to={`/orders/${request.order_id}/claims`}>
                      创建 Medusa 原生理赔
                    </Link>
                  </Button>
                )}
              </div>
              {!!request.attachments?.length && (
                <div>
                  <Text size="small" weight="plus">客户凭证</Text>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {request.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md border p-3 text-sm text-ui-fg-interactive hover:bg-ui-bg-subtle"
                      >
                        查看图片 · {Math.ceil(attachment.size / 1024)} KB
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <Info label="类型" value={typeLabel[request.type]} />
                <Info label="状态" value={statusLabel[request.status]} />
                <Info label="原因" value={request.reason_code} />
                <Info
                  label="预计金额"
                  value={`${request.refund_amount ?? "—"} ${request.currency_code.toUpperCase()}`}
                />
              </div>
              {request.customer_note && (
                <div>
                  <Text size="small" weight="plus">
                    客户说明
                  </Text>
                  <Text
                    size="small"
                    className="mt-1 whitespace-pre-wrap text-ui-fg-subtle"
                  >
                    {request.customer_note}
                  </Text>
                </div>
              )}
              <div>
                <Text size="small" weight="plus">
                  申请商品
                </Text>
                <div className="mt-2 flex flex-col gap-2">
                  {request.items?.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-md bg-ui-bg-subtle px-4 py-3"
                    >
                      <Text size="small" weight="plus">
                        {item.title}
                      </Text>
                      <Text size="small" className="text-ui-fg-subtle">
                        数量 {item.quantity} · {item.order_item_id}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Text size="small" weight="plus">
                  处理记录
                </Text>
                <div className="mt-2 flex flex-col gap-2">
                  {request.history?.map((entry) => (
                    <div
                      key={entry.id}
                      className="border-l-2 border-ui-border-base pl-3"
                    >
                      <Text size="small">
                        {statusLabel[entry.from_status] || "创建"} →{" "}
                        {statusLabel[entry.to_status]}
                      </Text>
                      <Text size="xsmall" className="text-ui-fg-subtle">
                        {new Date(entry.created_at).toLocaleString()}{" "}
                        {entry.note ? `· ${entry.note}` : ""}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
              <form
                className="flex flex-col gap-y-3 border-t pt-5"
                onSubmit={submit}
              >
                <Text size="small" weight="plus">
                  更新处理状态
                </Text>
                <Select value={nextStatus} onValueChange={setNextStatus} disabled={!availableStatuses.length}>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {availableStatuses.map((value) => (
                      <Select.Item key={value} value={value}>
                        {statusLabel[value]}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
                <Select value={resolution} onValueChange={setResolution}>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="no_action">无额外处理</Select.Item>
                    <Select.Item value="replacement">补发</Select.Item>
                    <Select.Item value="partial_refund">部分退款</Select.Item>
                    <Select.Item value="full_refund">全额退款</Select.Item>
                    <Select.Item value="store_credit">商店余额</Select.Item>
                  </Select.Content>
                </Select>
                {request.type !== "cancel" && (
                  <Input
                    value={reference}
                    onChange={(event) => setReference(event.target.value)}
                    placeholder="Medusa 退货/换货/理赔 ID（创建后填写）"
                  />
                )}
                <Textarea
                  rows={4}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="内部处理备注（客户不可见）"
                />
                <Textarea
                  rows={4}
                  value={customerMessage}
                  onChange={(event) => setCustomerMessage(event.target.value)}
                  placeholder="客户可见说明，例如退货地址、包装要求和下一步操作"
                />
                <Button
                  size="small"
                  type="submit"
                  isLoading={mutation.isPending}
                  disabled={!availableStatuses.length}
                >
                  保存状态
                </Button>
                {request.type !== "cancel" && (
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    请在订单详情中完成 Medusa 原生退货或理赔操作，再把生成的 ID 关联到本申请；本店不提供直接换货。
                  </Text>
                )}
              </form>
            </>
          )}
        </Drawer.Body>
      </Drawer.Content>
    </Drawer>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Text size="small" className="text-ui-fg-subtle">
        {label}
      </Text>
      <Text size="small" weight="plus">
        {value}
      </Text>
    </div>
  );
}

export const config = defineRouteConfig({
  label: "售后服务",
  icon: ShoppingBag,
  rank: 10,
});
export default AfterSalesPage;
