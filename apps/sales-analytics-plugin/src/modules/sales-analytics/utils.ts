import { createHash } from "node:crypto";

export const toNumber = (value: unknown): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") return Number(value) || 0;
  if (value && typeof value === "object") {
    const candidate = value as { numeric_?: unknown; value?: unknown };
    return toNumber(candidate.numeric_ ?? candidate.value);
  }
  return 0;
};

export const roundAmount = (value: number) =>
  Math.round((value + Number.EPSILON) * 10000) / 10000;

export const customerKey = (
  customerId?: string | null,
  email?: string | null,
) => {
  const normalized = email?.trim().toLowerCase();
  if (normalized) {
    return `email:${createHash("sha256").update(normalized).digest("hex")}`;
  }
  return customerId ? `customer:${customerId}` : null;
};

export const SALES_ANALYTICS_TIMEZONE = (() => {
  const configured = process.env.SALES_ANALYTICS_TIMEZONE || "America/New_York";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: configured }).format(
      new Date(),
    );
    return configured;
  } catch {
    return "America/New_York";
  }
})();

export const dayInTimeZone = (
  value: Date | string,
  timeZone = SALES_ANALYTICS_TIMEZONE,
) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((entry) => entry.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
};

export const REVENUE_PAYMENT_STATUSES = new Set([
  "captured",
  "partially_captured",
  "partially_refunded",
  "refunded",
]);

export const isRevenueOrder = (
  status?: string | null,
  paymentStatus?: string | null,
) =>
  !["draft", "canceled"].includes(status || "") &&
  REVENUE_PAYMENT_STATUSES.has(paymentStatus || "");

const DATE_MS = 86_400_000;

export const periodBefore = (dateFrom: string, dateTo: string) => {
  const from = new Date(`${dateFrom}T00:00:00.000Z`);
  const to = new Date(`${dateTo}T00:00:00.000Z`);
  const days = Math.floor((to.getTime() - from.getTime()) / DATE_MS) + 1;
  const previousTo = new Date(from);
  previousTo.setUTCDate(previousTo.getUTCDate() - 1);
  const previousFrom = new Date(previousTo);
  previousFrom.setUTCDate(previousFrom.getUTCDate() - days + 1);
  return {
    days,
    previousFrom: previousFrom.toISOString().slice(0, 10),
    previousTo: previousTo.toISOString().slice(0, 10),
  };
};

export const isDateRangeValid = (dateFrom: string, dateTo: string) =>
  new Date(`${dateFrom}T00:00:00.000Z`).getTime() <=
  new Date(`${dateTo}T00:00:00.000Z`).getTime();

// Kept as an alias for plugin consumers compiled against the first release.
export const utcDay = dayInTimeZone;
