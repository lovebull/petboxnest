import {
  customerKey,
  dayInTimeZone,
  isDateRangeValid,
  isRevenueOrder,
  periodBefore,
} from "../../../../sales-analytics-plugin/src/modules/sales-analytics/utils";

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
});
