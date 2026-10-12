import { MedusaService } from "@medusajs/framework/utils"
import {
  SalesCustomerFact,
  SalesDailyMetric,
  SalesOrderFact,
  SalesSyncState,
} from "./models"

class SalesAnalyticsModuleService extends MedusaService({
  SalesOrderFact,
  SalesDailyMetric,
  SalesCustomerFact,
  SalesSyncState,
}) {}

export default SalesAnalyticsModuleService
