import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { SALES_ANALYTICS_MODULE } from "../../../modules/sales-analytics";
import type SalesAnalyticsModuleService from "../../../modules/sales-analytics/service";
import {
  dayInTimeZone,
  isDateRangeValid,
  periodBefore,
  roundAmount,
  SALES_ANALYTICS_TIMEZONE,
} from "../../../modules/sales-analytics/utils";
import type { CommerceAnalyticsQuery } from "../../validators";

const normalizeNumbers = <T extends Record<string, number>>(value: T): T =>
  Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, roundAmount(entry)]),
  ) as T;

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<SalesAnalyticsModuleService>(
    SALES_ANALYTICS_MODULE,
  );
  const query = req.validatedQuery as CommerceAnalyticsQuery;
  const today = dayInTimeZone(new Date());
  const fallbackFrom = new Date(`${today}T00:00:00.000Z`);
  fallbackFrom.setUTCDate(fallbackFrom.getUTCDate() - 29);
  const dateFrom = query.date_from || fallbackFrom.toISOString().slice(0, 10);
  const dateTo = query.date_to || today;

  if (!isDateRangeValid(dateFrom, dateTo)) {
    res.status(400).json({ message: "date_from must not be after date_to" });
    return;
  }

  const comparison = periodBefore(dateFrom, dateTo);
  const granularity: "hour" | "day" =
    query.granularity === "hour" ||
    (query.granularity === "auto" && comparison.days === 1)
      ? "hour"
      : "day";
  const availableCurrencies = await service.getAvailableCurrencies();
  const currencyCode = query.currency_code || availableCurrencies[0] || "usd";
  const salesInput = {
    currency_code: currencyCode,
    timezone: SALES_ANALYTICS_TIMEZONE,
  };
  const trafficInput = { timezone: SALES_ANALYTICS_TIMEZONE };
  const [sales, traffic, previousSales, previousTraffic, series] =
    await Promise.all([
      service.getSalesSummary({
        ...salesInput,
        date_from: dateFrom,
        date_to: dateTo,
      }),
      service.getTrafficSummary({
        ...trafficInput,
        date_from: dateFrom,
        date_to: dateTo,
      }),
      service.getSalesSummary({
        ...salesInput,
        date_from: comparison.previousFrom,
        date_to: comparison.previousTo,
      }),
      service.getTrafficSummary({
        ...trafficInput,
        date_from: comparison.previousFrom,
        date_to: comparison.previousTo,
      }),
      service.getCommerceSeries({
        ...salesInput,
        date_from: dateFrom,
        date_to: dateTo,
        granularity,
      }),
    ]);

  res.json({
    period: {
      date_from: dateFrom,
      date_to: dateTo,
      previous_date_from: comparison.previousFrom,
      previous_date_to: comparison.previousTo,
      granularity,
      timezone: SALES_ANALYTICS_TIMEZONE,
    },
    currency_code: currencyCode,
    available_currencies: availableCurrencies,
    summary: normalizeNumbers({ ...sales, ...traffic }),
    previous_summary: normalizeNumbers({
      ...previousSales,
      ...previousTraffic,
    }),
    series,
    definitions: {
      conversion_rate:
        "Sessions with a completed order divided by all sessions.",
      returning_customer_rate:
        "Unique returning customers divided by unique identified customers in the period.",
      revenue_basis:
        "Only captured, partially captured, partially refunded, or refunded orders are included.",
      timezone: SALES_ANALYTICS_TIMEZONE,
    },
  });
}
