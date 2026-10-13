import { SALES_ANALYTICS_MODULE } from "../../../modules/sales-analytics";
import {
  nextOrderMilestone,
  ORDER_MILESTONE_THRESHOLDS,
  orderMilestoneCopy,
  orderMilestoneProgress,
  previousOrderMilestone,
} from "../../../modules/sales-analytics/order-milestones";
import type SalesAnalyticsModuleService from "../../../modules/sales-analytics/service";

export const getOrderMilestoneOverview = async (
  scope: { resolve: <T>(name: string) => T },
  adminUserId: string,
) => {
  const service = scope.resolve<SalesAnalyticsModuleService>(
    SALES_ANALYTICS_MODULE,
  );
  const [orderCount, achieved, acknowledgements] = await Promise.all([
    service.getValidOrderCount(),
    service.listOrderMilestones({}, { order: { threshold: "ASC" } }),
    service.listOrderMilestoneAcknowledgements({
      admin_user_id: adminUserId,
    }),
  ]);
  const achievedByThreshold = new Map(
    achieved.map((milestone) => [milestone.threshold, milestone]),
  );
  const dismissedIds = new Set(
    acknowledgements.map((acknowledgement) => acknowledgement.milestone_id),
  );
  const milestones = ORDER_MILESTONE_THRESHOLDS.map((threshold, index) => {
    const milestone = achievedByThreshold.get(threshold);
    const copy = orderMilestoneCopy(
      threshold,
      ORDER_MILESTONE_THRESHOLDS[index + 1] || null,
    );
    return {
      threshold,
      ...copy,
      achieved: Boolean(milestone),
      achieved_at: milestone?.achieved_at || null,
      achieved_order_count: milestone?.achieved_order_count || null,
      id: milestone?.id || null,
      dismissed: milestone ? dismissedIds.has(milestone.id) : false,
    };
  });
  const unread = milestones.filter(
    (milestone) => milestone.achieved && !milestone.dismissed,
  );
  const next = nextOrderMilestone(orderCount);
  const previous = previousOrderMilestone(orderCount);

  return {
    current_order_count: orderCount,
    next_milestone: next,
    previous_milestone: previous,
    remaining_orders: next ? Math.max(0, next - orderCount) : 0,
    progress_percentage: orderMilestoneProgress(orderCount, previous, next),
    unread_count: unread.length,
    latest_unread: unread[unread.length - 1] || null,
    milestones,
  };
};
