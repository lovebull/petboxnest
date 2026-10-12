import { model } from "@medusajs/framework/utils"

const SalesDailyMetric = model
  .define(
    { tableName: "pbn_sales_daily_metric", name: "SalesDailyMetric" },
    {
      id: model.id({ prefix: "saday" }).primaryKey(),
      metric_key: model.text().unique(),
      metric_date: model.text(),
      currency_code: model.text(),
      gross_sales: model.bigNumber().default(0),
      discounts: model.bigNumber().default(0),
      refunds: model.bigNumber().default(0),
      net_sales: model.bigNumber().default(0),
      shipping_total: model.bigNumber().default(0),
      tax_total: model.bigNumber().default(0),
      total_sales: model.bigNumber().default(0),
      order_count: model.number().default(0),
      units_sold: model.number().default(0),
      fully_shipped_orders: model.number().default(0),
      partially_shipped_orders: model.number().default(0),
      customer_count: model.number().default(0),
      returning_customer_count: model.number().default(0),
      calculated_at: model.dateTime(),
    }
  )
  .indexes([
    { name: "IDX_pbn_sales_daily_date_currency", on: ["metric_date", "currency_code"] },
  ])

export default SalesDailyMetric
