import { MedusaService } from "@medusajs/framework/utils"
import {
  SalesCustomerFact,
  SalesDailyMetric,
  SalesOrderFact,
  SalesSyncState,
  StorefrontAnalyticsEvent,
  StorefrontAnalyticsSession,
} from "./models"

class SalesAnalyticsModuleService extends MedusaService({
  SalesOrderFact,
  SalesDailyMetric,
  SalesCustomerFact,
  SalesSyncState,
  StorefrontAnalyticsEvent,
  StorefrontAnalyticsSession,
}) {}

export default SalesAnalyticsModuleService
