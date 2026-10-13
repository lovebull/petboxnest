import type { MedusaContainer } from "@medusajs/framework/types";

type SalesAnalyticsService = {
  getAvailableCurrencies(): Promise<string[]>;
  getSalesSummary(input: {
    date_from: string;
    date_to: string;
    currency_code: string;
    timezone: string;
  }): Promise<{ order_count: number }>;
  getSalesSeries(input: {
    date_from: string;
    date_to: string;
    currency_code: string;
    timezone: string;
  }): Promise<unknown[]>;
  getTrafficSummary(input: {
    date_from: string;
    date_to: string;
    timezone: string;
  }): Promise<{ visits: number }>;
  getCommerceSeries(input: {
    date_from: string;
    date_to: string;
    currency_code: string;
    timezone: string;
    granularity: "day";
  }): Promise<unknown[]>;
};

export default async function verifySalesAnalytics({
  container,
}: {
  container: MedusaContainer;
}) {
  const service = container.resolve<SalesAnalyticsService>("salesAnalytics");
  const dateTo = new Date().toISOString().slice(0, 10);
  const dateFrom = new Date(Date.now() - 6 * 86_400_000)
    .toISOString()
    .slice(0, 10);
  const timezone = process.env.SALES_ANALYTICS_TIMEZONE || "America/New_York";
  const currencies = await service.getAvailableCurrencies();
  const currencyCode = currencies[0] || "usd";
  const range = {
    date_from: dateFrom,
    date_to: dateTo,
    currency_code: currencyCode,
    timezone,
  };

  const [summary, salesSeries, traffic, commerceSeries] = await Promise.all([
    service.getSalesSummary(range),
    service.getSalesSeries(range),
    service.getTrafficSummary(range),
    service.getCommerceSeries({ ...range, granularity: "day" }),
  ]);

  console.log(
    JSON.stringify({
      ok: true,
      currency_code: currencyCode,
      order_count: summary.order_count,
      visits: traffic.visits,
      sales_buckets: salesSeries.length,
      commerce_buckets: commerceSeries.length,
    }),
  );
}
