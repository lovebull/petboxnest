import { CheckCircleSolid, Spinner, Trophy } from "@medusajs/icons";
import { Badge, Button, Container, Heading, Text, toast } from "@medusajs/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { sdk } from "../../lib/sdk";
import type { AdminOrderMilestone, OrderMilestonesResponse } from "../../types";

const queryKey = ["order-milestones"];
const formatCount = (value: number) => value.toLocaleString("en-US");

const MilestoneCard = ({ milestone }: { milestone: AdminOrderMilestone }) => (
  <div
    className={`rounded-lg border p-4 ${
      milestone.achieved
        ? "bg-ui-bg-component"
        : "border-ui-border-base bg-ui-bg-subtle"
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
            milestone.achieved
              ? "bg-ui-tag-green-bg text-ui-tag-green-icon"
              : "bg-ui-bg-base text-ui-fg-muted"
          }`}
        >
          {milestone.achieved ? <CheckCircleSolid /> : <Trophy />}
        </div>
        <div>
          <Text size="small" leading="compact" weight="plus">
            {formatCount(milestone.threshold)} 笔订单
          </Text>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            {formatCount(milestone.threshold)} orders
          </Text>
        </div>
      </div>
      <Badge color={milestone.achieved ? "green" : "grey"}>
        {milestone.achieved ? "已达成 / Achieved" : "未达成 / Locked"}
      </Badge>
    </div>
    {milestone.achieved_at && (
      <Text size="xsmall" className="mt-3 text-ui-fg-muted">
        达成时间 / Achieved {new Date(milestone.achieved_at).toLocaleString()}
      </Text>
    )}
  </div>
);

export const OrderMilestonesPage = () => {
  const queryClient = useQueryClient();
  const milestones = useQuery({
    queryKey,
    queryFn: () =>
      sdk.client.fetch<OrderMilestonesResponse>("/admin/order-milestones"),
  });
  const evaluate = useMutation({
    mutationFn: () =>
      sdk.client.fetch<OrderMilestonesResponse>(
        "/admin/order-milestones/evaluate",
        { method: "POST" },
      ),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
      toast.success("里程碑检测完成 / Milestones updated");
    },
    onError: (error: Error) =>
      toast.error(error.message || "里程碑检测失败，请重试"),
  });
  const dismiss = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/order-milestones/${id}/dismiss`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("提醒已确认 / Milestone acknowledged");
    },
    onError: (error: Error) =>
      toast.error(error.message || "无法确认提醒，请重试"),
  });

  if (milestones.isLoading) {
    return (
      <Container className="flex justify-center p-16">
        <Spinner />
      </Container>
    );
  }

  if (milestones.isError || !milestones.data) {
    return (
      <Container className="px-6 py-12">
        <Heading level="h2">订单里程碑加载失败</Heading>
        <Text className="text-ui-fg-subtle">
          Order milestones could not be loaded.
        </Text>
      </Container>
    );
  }

  const overview = milestones.data.order_milestones;
  const latest = overview.latest_unread;

  return (
    <div className="flex flex-col gap-3">
      <Container className="p-0">
        <div className="flex flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Heading level="h1">订单里程碑</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Order milestones · 记录每一次值得庆祝的增长
            </Text>
          </div>
          <Button
            size="small"
            variant="secondary"
            isLoading={evaluate.isPending}
            onClick={() => evaluate.mutate()}
          >
            检测最新里程碑
          </Button>
        </div>
      </Container>

      {latest && latest.id && (
        <Container className="overflow-hidden p-0">
          <div className="bg-ui-bg-inverse px-6 py-6 text-ui-fg-on-inverted">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 flex items-center gap-2">
                  <Trophy />
                  <Text size="small" weight="plus">
                    新成就 / New milestone
                  </Text>
                </div>
                <Heading level="h2" className="text-ui-fg-on-inverted">
                  {latest.title}
                </Heading>
                <Text className="mt-2 text-ui-fg-on-inverted">
                  {latest.message}
                </Text>
                <Text size="small" className="mt-1 text-ui-fg-muted">
                  {latest.message_en}
                </Text>
              </div>
              <Button
                size="small"
                variant="secondary"
                isLoading={dismiss.isPending}
                onClick={() => dismiss.mutate(latest.id as string)}
              >
                我知道了 / Celebrate
              </Button>
            </div>
          </div>
        </Container>
      )}

      <Container className="p-0">
        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-center">
          <div>
            <Text size="small" leading="compact" weight="plus">
              当前累计有效订单 / Valid lifetime orders
            </Text>
            <Heading level="h1" className="mt-2 text-4xl">
              {formatCount(overview.current_order_count)}
            </Heading>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-ui-bg-subtle">
              <div
                className="h-full rounded-full bg-ui-fg-interactive transition-all"
                style={{ width: `${overview.progress_percentage}%` }}
              />
            </div>
            <Text size="small" className="mt-2 text-ui-fg-subtle">
              {overview.next_milestone
                ? `距离 ${formatCount(overview.next_milestone)} 笔目标还差 ${formatCount(overview.remaining_orders)} 笔`
                : "已完成当前全部里程碑 / All milestones achieved"}
            </Text>
          </div>
          <div className="rounded-lg border bg-ui-bg-subtle p-4">
            <Text size="small" className="text-ui-fg-subtle">
              下一个目标 / Next goal
            </Text>
            <Heading level="h2" className="mt-1">
              {overview.next_milestone
                ? `${formatCount(overview.next_milestone)} 笔`
                : "100,000+"}
            </Heading>
            <Text size="xsmall" className="mt-2 text-ui-fg-muted">
              仅统计销售分析中的有效订单，不包含草稿、取消和未付款订单。
            </Text>
          </div>
        </div>
      </Container>

      <Container className="p-0">
        <div className="border-b px-6 py-4">
          <Heading level="h2">成长记录 / Achievement history</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            里程碑一旦达成会永久保留，不因后续退款而撤销。
          </Text>
        </div>
        <div className="grid gap-3 px-6 py-5 md:grid-cols-2 xl:grid-cols-3">
          {overview.milestones.map((milestone) => (
            <MilestoneCard key={milestone.threshold} milestone={milestone} />
          ))}
        </div>
      </Container>
    </div>
  );
};

const LegacyOrderMilestonesRoute = () => (
  <Navigate to="/analytics/milestones" replace />
);

export default LegacyOrderMilestonesRoute;
