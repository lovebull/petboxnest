import type { Context } from "@medusajs/framework/types";
import {
  InjectManager,
  MedusaContext,
  MedusaService,
} from "@medusajs/framework/utils";
import {
  SalesCustomerFact,
  SalesDailyMetric,
  SalesOrderFact,
  SalesSyncState,
  SalesAnalyticsSetting,
  StorefrontAnalyticsEvent,
  StorefrontAnalyticsSession,
} from "./models";

class SalesAnalyticsModuleService extends MedusaService({
  SalesOrderFact,
  SalesDailyMetric,
  SalesCustomerFact,
  SalesSyncState,
  SalesAnalyticsSetting,
  StorefrontAnalyticsEvent,
  StorefrontAnalyticsSession,
}) {
  private connection(sharedContext: Context) {
    const manager = sharedContext.manager as {
      getConnection: () => {
        execute: <T extends Record<string, unknown>>(
          sql: string,
          parameters?: unknown[],
        ) => Promise<T[]>;
      };
    };
    return manager.getConnection();
  }

  @InjectManager()
  async getAvailableCurrencies(
    @MedusaContext() sharedContext: Context = {},
  ): Promise<string[]> {
    const rows = await this.connection(sharedContext).execute<{
      currency_code: string;
    }>(
      `select distinct currency_code
       from pbn_sales_order_fact
       where deleted_at is null and is_valid = true
       order by currency_code`,
    );
    return rows.map((row) => row.currency_code);
  }

  @InjectManager()
  async getSalesSummary(
    input: {
      date_from: string;
      date_to: string;
      currency_code: string;
      timezone: string;
    },
    @MedusaContext() sharedContext: Context = {},
  ) {
    const [row] = await this.connection(sharedContext).execute<
      Record<string, string | number>
    >(
      `select
         coalesce(sum(gross_sales), 0)::double precision as gross_sales,
         coalesce(sum(discounts), 0)::double precision as discounts,
         coalesce(sum(refunds), 0)::double precision as refunds,
         coalesce(sum(net_sales), 0)::double precision as net_sales,
         coalesce(sum(shipping_total), 0)::double precision as shipping_total,
         coalesce(sum(tax_total), 0)::double precision as tax_total,
         coalesce(sum(total_sales), 0)::double precision as total_sales,
         count(*)::integer as order_count,
         coalesce(sum(units_sold), 0)::integer as units_sold,
         count(distinct customer_key) filter (where customer_key is not null)::integer as customer_count,
         count(distinct customer_key) filter (
           where customer_key is not null and is_returning_customer = true
         )::integer as returning_customer_count,
         count(*) filter (
           where fulfillment_status in ('fulfilled', 'shipped', 'delivered')
         )::integer as fully_shipped_orders,
         count(*) filter (
           where fulfillment_status = 'partially_fulfilled'
         )::integer as partially_shipped_orders,
         count(*) filter (where refunds > 0)::integer as refunded_orders
       from pbn_sales_order_fact
       where deleted_at is null
         and is_valid = true
         and currency_code = ?
         and (ordered_at at time zone ?)::date between ?::date and ?::date`,
      [input.currency_code, input.timezone, input.date_from, input.date_to],
    );
    const orderCount = Number(row?.order_count || 0);
    const totalSales = Number(row?.total_sales || 0);
    const customerCount = Number(row?.customer_count || 0);
    const returningCustomerCount = Number(row?.returning_customer_count || 0);
    return {
      gross_sales: Number(row?.gross_sales || 0),
      discounts: Number(row?.discounts || 0),
      refunds: Number(row?.refunds || 0),
      net_sales: Number(row?.net_sales || 0),
      shipping_total: Number(row?.shipping_total || 0),
      tax_total: Number(row?.tax_total || 0),
      total_sales: totalSales,
      order_count: orderCount,
      units_sold: Number(row?.units_sold || 0),
      average_order_value: orderCount ? totalSales / orderCount : 0,
      customer_count: customerCount,
      returning_customer_count: returningCustomerCount,
      returning_customer_rate: customerCount
        ? (returningCustomerCount / customerCount) * 100
        : 0,
      fully_shipped_orders: Number(row?.fully_shipped_orders || 0),
      partially_shipped_orders: Number(row?.partially_shipped_orders || 0),
      refunded_orders: Number(row?.refunded_orders || 0),
    };
  }

  @InjectManager()
  async getSalesSeries(
    input: {
      date_from: string;
      date_to: string;
      currency_code: string;
      timezone: string;
    },
    @MedusaContext() sharedContext: Context = {},
  ) {
    const rows = await this.connection(sharedContext).execute<
      Record<string, string | number>
    >(
      `with buckets as (
         select generate_series(?::date, ?::date, interval '1 day')::date as bucket
       ), totals as (
         select
           (ordered_at at time zone ?)::date as bucket,
           coalesce(sum(gross_sales), 0)::double precision as gross_sales,
           coalesce(sum(net_sales), 0)::double precision as net_sales,
           coalesce(sum(total_sales), 0)::double precision as total_sales,
           count(*)::integer as order_count
         from pbn_sales_order_fact
         where deleted_at is null
           and is_valid = true
           and currency_code = ?
           and (ordered_at at time zone ?)::date between ?::date and ?::date
         group by 1
       )
       select
         to_char(buckets.bucket, 'YYYY-MM-DD') as date,
         coalesce(totals.gross_sales, 0)::double precision as gross_sales,
         coalesce(totals.net_sales, 0)::double precision as net_sales,
         coalesce(totals.total_sales, 0)::double precision as total_sales,
         coalesce(totals.order_count, 0)::integer as order_count
       from buckets
       left join totals using (bucket)
       order by buckets.bucket`,
      [
        input.date_from,
        input.date_to,
        input.timezone,
        input.currency_code,
        input.timezone,
        input.date_from,
        input.date_to,
      ],
    );
    return rows.map((row) => ({
      date: String(row.date),
      gross_sales: Number(row.gross_sales || 0),
      net_sales: Number(row.net_sales || 0),
      total_sales: Number(row.total_sales || 0),
      order_count: Number(row.order_count || 0),
    }));
  }

  @InjectManager()
  async getTrafficSummary(
    input: { date_from: string; date_to: string; timezone: string },
    @MedusaContext() sharedContext: Context = {},
  ) {
    const [row] = await this.connection(sharedContext).execute<
      Record<string, string | number>
    >(
      `select
         count(*)::integer as visits,
         count(*) filter (where is_returning_visitor = false)::integer as new_visits,
         count(*) filter (where is_returning_visitor = true)::integer as returning_visits,
         count(*) filter (where has_added_to_cart = true)::integer as added_to_cart_sessions,
         count(*) filter (where has_started_checkout = true)::integer as checkout_sessions,
         count(*) filter (where has_completed_order = true)::integer as completed_sessions
       from pbn_storefront_analytics_session
       where deleted_at is null
         and (started_at at time zone ?)::date between ?::date and ?::date`,
      [input.timezone, input.date_from, input.date_to],
    );
    const visits = Number(row?.visits || 0);
    const rate = (value: unknown) =>
      visits ? (Number(value || 0) / visits) * 100 : 0;
    return {
      visits,
      new_visits: Number(row?.new_visits || 0),
      returning_visits: Number(row?.returning_visits || 0),
      added_to_cart_sessions: Number(row?.added_to_cart_sessions || 0),
      checkout_sessions: Number(row?.checkout_sessions || 0),
      completed_sessions: Number(row?.completed_sessions || 0),
      add_to_cart_rate: rate(row?.added_to_cart_sessions),
      checkout_rate: rate(row?.checkout_sessions),
      conversion_rate: rate(row?.completed_sessions),
    };
  }

  @InjectManager()
  async getCommerceSeries(
    input: {
      date_from: string;
      date_to: string;
      currency_code: string;
      timezone: string;
      granularity: "hour" | "day";
    },
    @MedusaContext() sharedContext: Context = {},
  ) {
    const isHour = input.granularity === "hour";
    const sessionBucketExpression = isHour
      ? `date_trunc('hour', started_at at time zone ?)`
      : `date_trunc('day', started_at at time zone ?)`;
    const orderBucketExpression = isHour
      ? `date_trunc('hour', ordered_at at time zone ?)`
      : `date_trunc('day', ordered_at at time zone ?)`;
    const start = isHour ? `${input.date_from} 00:00:00` : input.date_from;
    const end = isHour ? `${input.date_to} 23:00:00` : input.date_to;
    const step = isHour ? "1 hour" : "1 day";
    const rows = await this.connection(sharedContext).execute<
      Record<string, string | number>
    >(
      `with buckets as (
         select generate_series(?::timestamp, ?::timestamp, ?::interval) as bucket
       ), sales as (
         select
           ${orderBucketExpression} as bucket,
           coalesce(sum(total_sales), 0)::double precision as total_sales,
           count(*)::integer as order_count,
           count(distinct customer_key) filter (
             where customer_key is not null and is_returning_customer = false
           )::integer as new_customers,
           count(distinct customer_key) filter (
             where customer_key is not null and is_returning_customer = true
           )::integer as returning_customers
         from pbn_sales_order_fact
         where deleted_at is null and is_valid = true and currency_code = ?
           and (ordered_at at time zone ?)::date between ?::date and ?::date
         group by 1
       ), traffic as (
         select
           ${sessionBucketExpression} as bucket,
           count(*)::integer as visits,
           count(*) filter (where is_returning_visitor = false)::integer as new_visits,
           count(*) filter (where is_returning_visitor = true)::integer as returning_visits
         from pbn_storefront_analytics_session
         where deleted_at is null
           and (started_at at time zone ?)::date between ?::date and ?::date
         group by 1
       )
       select
         to_char(buckets.bucket, ?) as bucket,
         coalesce(sales.total_sales, 0)::double precision as total_sales,
         coalesce(sales.order_count, 0)::integer as order_count,
         coalesce(traffic.visits, 0)::integer as visits,
         coalesce(traffic.new_visits, 0)::integer as new_visits,
         coalesce(traffic.returning_visits, 0)::integer as returning_visits,
         coalesce(sales.new_customers, 0)::integer as new_customers,
         coalesce(sales.returning_customers, 0)::integer as returning_customers
       from buckets
       left join sales using (bucket)
       left join traffic using (bucket)
       order by buckets.bucket`,
      [
        start,
        end,
        step,
        input.timezone,
        input.currency_code,
        input.timezone,
        input.date_from,
        input.date_to,
        input.timezone,
        input.timezone,
        input.date_from,
        input.date_to,
        isHour ? "YYYY-MM-DD HH24:00" : "YYYY-MM-DD",
      ],
    );
    return rows.map((row) => ({
      bucket: String(row.bucket),
      total_sales: Number(row.total_sales || 0),
      order_count: Number(row.order_count || 0),
      visits: Number(row.visits || 0),
      new_visits: Number(row.new_visits || 0),
      returning_visits: Number(row.returning_visits || 0),
      new_customers: Number(row.new_customers || 0),
      returning_customers: Number(row.returning_customers || 0),
    }));
  }
}

export default SalesAnalyticsModuleService;
