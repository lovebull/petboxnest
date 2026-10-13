import {
  customerKey,
  dayInTimeZone,
  isDateRangeValid,
  isRevenueOrder,
  periodBefore,
} from "../../../../sales-analytics-plugin/src/modules/sales-analytics/utils";
import {
  nextOrderMilestone,
  ORDER_MILESTONE_THRESHOLDS,
  orderMilestoneCopy,
  orderMilestoneProgress,
  previousOrderMilestone,
} from "../../../../sales-analytics-plugin/src/modules/sales-analytics/order-milestones";

describe("sales analytics utilities", () => {
  it("uses the normalized email identity for guest and registered orders", () => {
    const guest = customerKey(null, " Customer@Example.com ");
    const registered = customerKey("cus_123", "customer@example.com");

    expect(guest).toEqual(registered);
    expect(guest).toMatch(/^email:[a-f0-9]{64}$/);
  });

  it("falls back to customer ID when an email is unavailable", () => {
    expect(customerKey("cus_123", null)).toBe("customer:cus_123");
    expect(customerKey(null, null)).toBeNull();
  });

  it.each(["captured", "partially_captured", "partially_refunded", "refunded"])(
    "includes %s orders in revenue",
    (paymentStatus) => {
      expect(isRevenueOrder("pending", paymentStatus)).toBe(true);
    },
  );

  it.each(["not_paid", "awaiting", "authorized", "requires_action"])(
    "excludes %s orders from revenue",
    (paymentStatus) => {
      expect(isRevenueOrder("pending", paymentStatus)).toBe(false);
    },
  );

  it("always excludes canceled and draft orders", () => {
    expect(isRevenueOrder("canceled", "captured")).toBe(false);
    expect(isRevenueOrder("draft", "captured")).toBe(false);
  });

  it("uses the configured business timezone at UTC date boundaries", () => {
    expect(dayInTimeZone("2026-10-13T02:30:00.000Z", "America/New_York")).toBe(
      "2026-10-12",
    );
  });

  it("calculates the previous comparison period with equal length", () => {
    expect(periodBefore("2026-10-01", "2026-10-07")).toEqual({
      days: 7,
      previousFrom: "2026-09-24",
      previousTo: "2026-09-30",
    });
  });

  it("validates date range order", () => {
    expect(isDateRangeValid("2026-10-01", "2026-10-01")).toBe(true);
    expect(isDateRangeValid("2026-10-02", "2026-10-01")).toBe(false);
  });

  it("defines ordered milestones up to one hundred thousand orders", () => {
    expect(ORDER_MILESTONE_THRESHOLDS).toEqual([
      1, 100, 500, 1_000, 2_000, 5_000, 10_000, 20_000, 50_000, 100_000,
    ]);
  });

  it("finds the surrounding order milestones", () => {
    expect(previousOrderMilestone(750)).toBe(500);
    expect(nextOrderMilestone(750)).toBe(1_000);
    expect(nextOrderMilestone(100_000)).toBeNull();
  });

  it("calculates progress within the active milestone range", () => {
    expect(orderMilestoneProgress(750, 500, 1_000)).toBe(50);
    expect(orderMilestoneProgress(100_000, 100_000, null)).toBe(100);
  });

  it("builds milestone copy using the actual next target", () => {
    const copy = orderMilestoneCopy(100, 500);
    expect(copy.title).toContain("100");
    expect(copy.message).toContain("500");
    expect(copy.message).not.toContain("1,000");
  });
});
