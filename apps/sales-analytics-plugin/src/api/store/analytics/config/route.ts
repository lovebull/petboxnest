import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SALES_ANALYTICS_MODULE } from "../../../../modules/sales-analytics"
import type SalesAnalyticsModuleService from "../../../../modules/sales-analytics/service"
import { STOREFRONT_ANALYTICS_SETTINGS_KEY } from "../../../../workflows"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<SalesAnalyticsModuleService>(
    SALES_ANALYTICS_MODULE
  )
  const setting = (
    await service.listSalesAnalyticsSettings({
      key: STOREFRONT_ANALYTICS_SETTINGS_KEY,
    })
  )[0]
  const requireCookieConsent = setting?.require_cookie_consent ?? true

  res.setHeader("Cache-Control", "no-store")
  res.json({
    settings: {
      require_cookie_consent: requireCookieConsent,
      collect_before_consent: !requireCookieConsent,
    },
  })
}
