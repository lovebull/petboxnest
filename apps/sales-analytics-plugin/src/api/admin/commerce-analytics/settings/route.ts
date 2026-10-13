import type {
  AuthenticatedMedusaRequest,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { SALES_ANALYTICS_MODULE } from "../../../../modules/sales-analytics"
import type SalesAnalyticsModuleService from "../../../../modules/sales-analytics/service"
import {
  STOREFRONT_ANALYTICS_SETTINGS_KEY,
  updateSalesAnalyticsSettingsWorkflow,
} from "../../../../workflows"
import type { SalesAnalyticsSettingsBody } from "../../../validators"

const response = (requireCookieConsent: boolean) => ({
  settings: {
    require_cookie_consent: requireCookieConsent,
    collect_before_consent: !requireCookieConsent,
  },
})

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<SalesAnalyticsModuleService>(
    SALES_ANALYTICS_MODULE
  )
  const setting = (
    await service.listSalesAnalyticsSettings({
      key: STOREFRONT_ANALYTICS_SETTINGS_KEY,
    })
  )[0]

  res.json(response(setting?.require_cookie_consent ?? true))
}

export async function POST(
  req: AuthenticatedMedusaRequest<SalesAnalyticsSettingsBody>,
  res: MedusaResponse
) {
  const { result } = await updateSalesAnalyticsSettingsWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      admin_user_id: req.auth_context.actor_id,
    },
  })

  res.json(response(result.require_cookie_consent))
}
