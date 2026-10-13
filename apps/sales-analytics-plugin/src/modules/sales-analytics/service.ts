import { MedusaService } from "@medusajs/framework/utils"
import {
  SalesCustomerFact,
  SalesDailyMetric,
  SalesOrderFact,
  SalesSyncState,
  SalesAnalyticsSetting,
  StorefrontAnalyticsEvent,
  StorefrontAnalyticsSession,
} from "./models"

class SalesAnalyticsModuleService extends MedusaService({
  SalesOrderFact,
  SalesDailyMetric,
  SalesCustomerFact,
  SalesSyncState,
  SalesAnalyticsSetting,
  StorefrontAnalyticsEvent,
  StorefrontAnalyticsSession,
}) {}

export default SalesAnalyticsModuleService
