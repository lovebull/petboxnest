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
import type { SalesAnalyticsQuery } from "../../validators";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<SalesAnalyticsModuleService>(
    SALES_ANALYTICS_MODULE,
  );
  const query = req.validatedQuery as SalesAnalyticsQuery;
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
  const currencies = await service.getAvailableCurrencies();
  const currencyCode = query.currency_code || currencies[0] || "usd";
  const common = {
    currency_code: currencyCode,
    timezone: SALES_ANALYTICS_TIMEZONE,
  };
  const [summary, previousSummary, series, syncState] = await Promise.all([
    service.getSalesSummary({
      ...common,
      date_from: dateFrom,
      date_to: dateTo,
    }),
    service.getSalesSummary({
      ...common,
      date_from: comparison.previousFrom,
      date_to: comparison.previousTo,
    }),
    service.getSalesSeries({ ...common, date_from: dateFrom, date_to: dateTo }),
    service
      .listSalesSyncStates({ sync_key: "historical-rebuild" })
      .then((states) => states[0] || null),
  ]);

  const rounded = (value: number) => roundAmount(value);
  res.json({
    period: {
      date_from: dateFrom,
      date_to: dateTo,
      previous_date_from: comparison.previousFrom,
      previous_date_to: comparison.previousTo,
      timezone: SALES_ANALYTICS_TIMEZONE,
    },
    currency_code: currencyCode,
    available_currencies: currencies,
    summary: Object.fromEntries(
      Object.entries(summary).map(([key, value]) => [key, rounded(value)]),
    ),
    previous_summary: Object.fromEntries(
      Object.entries(previousSummary).map(([key, value]) => [
        key,
        rounded(value),
      ]),
    ),
    series,
    sync_state: syncState,
    definitions: {
      gross_sales: "Original item subtotal before discounts, shipping and tax.",
      net_sales: "Item subtotal minus recorded refunds, never below zero.",
      total_sales:
        "Captured order total minus recorded refunds, never below zero.",
      returning_customer_rate:
        "Unique identified customers in the period whose order is not their first captured order, divided by unique identified customers.",
      revenue_basis:
        "Only captured, partially captured, partially refunded, or refunded orders are included.",
      timezone: SALES_ANALYTICS_TIMEZONE,
    },
  });
}
