import { model } from "@medusajs/framework/utils"

const SalesAnalyticsSetting = model.define(
  {
    tableName: "pbn_sales_analytics_setting",
    name: "SalesAnalyticsSetting",
  },
  {
    id: model.id({ prefix: "saset" }).primaryKey(),
    key: model.text().unique(),
    require_cookie_consent: model.boolean().default(true),
    updated_by: model.text().nullable(),
  }
)

export default SalesAnalyticsSetting
