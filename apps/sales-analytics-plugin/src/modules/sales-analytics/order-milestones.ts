export const ORDER_MILESTONE_THRESHOLDS = [
  1, 100, 500, 1_000, 2_000, 5_000, 10_000, 20_000, 50_000, 100_000,
] as const;

export type OrderMilestoneThreshold =
  (typeof ORDER_MILESTONE_THRESHOLDS)[number];

export const nextOrderMilestone = (orderCount: number) =>
  ORDER_MILESTONE_THRESHOLDS.find((threshold) => threshold > orderCount) ||
  null;

export const previousOrderMilestone = (orderCount: number) =>
  [...ORDER_MILESTONE_THRESHOLDS]
    .reverse()
    .find((threshold) => threshold <= orderCount) || 0;

export const orderMilestoneProgress = (
  orderCount: number,
  previous: number,
  next: number | null,
) => {
  if (!next) return 100;
  const range = Math.max(1, next - previous);
  return Math.min(100, Math.max(0, ((orderCount - previous) / range) * 100));
};

export const orderMilestoneCopy = (threshold: number, next: number | null) => ({
  title: `恭喜您达成 ${threshold.toLocaleString("en-US")} 笔订单！`,
  title_en: `Congratulations on ${threshold.toLocaleString("en-US")} orders!`,
  message: next
    ? `这份成绩来之不易，值得庆祝。继续保持，向 ${next.toLocaleString("en-US")} 笔订单迈进！`
    : "十万笔订单是一项非凡成就，感谢团队一路以来的坚持与付出！",
  message_en: next
    ? `A milestone worth celebrating. Keep the momentum going toward ${next.toLocaleString("en-US")} orders.`
    : "One hundred thousand orders is an extraordinary achievement. Celebrate the team behind it.",
});
