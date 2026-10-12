import { model } from "@medusajs/framework/utils"

const SalesCustomerFact = model
  .define(
    { tableName: "pbn_sales_customer_fact", name: "SalesCustomerFact" },
    {
      id: model.id({ prefix: "sacust" }).primaryKey(),
      customer_key: model.text().unique(),
      customer_id: model.text().nullable(),
      first_order_at: model.dateTime(),
      last_order_at: model.dateTime(),
      order_count: model.number().default(0),
      lifetime_sales_by_currency: model.json().default({}),
      calculated_at: model.dateTime(),
    }
  )
  .indexes([{ name: "IDX_pbn_sales_customer_last_order", on: ["last_order_at"] }])

export default SalesCustomerFact
