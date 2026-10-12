import { model } from "@medusajs/framework/utils"

const SalesOrderFact = model
  .define(
    { tableName: "pbn_sales_order_fact", name: "SalesOrderFact" },
    {
      id: model.id({ prefix: "safact" }).primaryKey(),
      order_id: model.text().unique(),
      display_id: model.number(),
      customer_id: model.text().nullable(),
      customer_key: model.text().nullable(),
      currency_code: model.text(),
      status: model.text(),
      payment_status: model.text().nullable(),
      fulfillment_status: model.text().nullable(),
      order_day: model.text(),
      ordered_at: model.dateTime(),
      gross_sales: model.bigNumber().default(0),
      discounts: model.bigNumber().default(0),
      refunds: model.bigNumber().default(0),
      net_sales: model.bigNumber().default(0),
      shipping_total: model.bigNumber().default(0),
      tax_total: model.bigNumber().default(0),
      total_sales: model.bigNumber().default(0),
      units_ordered: model.number().default(0),
      units_returned: model.number().default(0),
      units_sold: model.number().default(0),
      is_valid: model.boolean().default(true),
      is_returning_customer: model.boolean().default(false),
      synced_at: model.dateTime(),
    }
  )
  .indexes([
    { name: "IDX_pbn_sales_fact_day_currency", on: ["order_day", "currency_code"] },
    { name: "IDX_pbn_sales_fact_customer", on: ["customer_key", "ordered_at"] },
    { name: "IDX_pbn_sales_fact_status", on: ["status", "ordered_at"] },
    { name: "IDX_pbn_sales_fact_fulfillment", on: ["fulfillment_status", "ordered_at"] },
  ])

export default SalesOrderFact
