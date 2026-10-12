import { Module } from "@medusajs/framework/utils"
import SalesAnalyticsModuleService from "./service"

export const SALES_ANALYTICS_MODULE = "salesAnalytics"

export default Module(SALES_ANALYTICS_MODULE, {
  service: SalesAnalyticsModuleService,
})
