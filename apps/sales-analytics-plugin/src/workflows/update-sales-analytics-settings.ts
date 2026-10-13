import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { SALES_ANALYTICS_MODULE } from "../modules/sales-analytics"
import type SalesAnalyticsModuleService from "../modules/sales-analytics/service"

export const STOREFRONT_ANALYTICS_SETTINGS_KEY = "storefront"

export type UpdateSalesAnalyticsSettingsInput = {
  require_cookie_consent: boolean
  admin_user_id?: string | null
}

type Compensation =
  | { action: "delete"; id: string }
  | { action: "restore"; previous: Record<string, unknown> }

const updateSalesAnalyticsSettingsStep = createStep(
  "update-sales-analytics-settings",
  async (input: UpdateSalesAnalyticsSettingsInput, { container }) => {
    const service = container.resolve<SalesAnalyticsModuleService>(
      SALES_ANALYTICS_MODULE
    )
    const existing = (
      await service.listSalesAnalyticsSettings({
        key: STOREFRONT_ANALYTICS_SETTINGS_KEY,
      })
    )[0]

    if (existing) {
      const setting = await service.updateSalesAnalyticsSettings({
        id: existing.id,
        require_cookie_consent: input.require_cookie_consent,
        updated_by: input.admin_user_id || null,
      })
      return new StepResponse(
        setting,
        {
          action: "restore",
          previous: existing as unknown as Record<string, unknown>,
        } satisfies Compensation
      )
    }

    const setting = await service.createSalesAnalyticsSettings({
      key: STOREFRONT_ANALYTICS_SETTINGS_KEY,
      require_cookie_consent: input.require_cookie_consent,
      updated_by: input.admin_user_id || null,
    })
    return new StepResponse(
      setting,
      { action: "delete", id: setting.id } satisfies Compensation
    )
  },
  async (compensation: Compensation | undefined, { container }) => {
    if (!compensation) return
    const service = container.resolve<SalesAnalyticsModuleService>(
      SALES_ANALYTICS_MODULE
    )
    if (compensation.action === "delete") {
      await service.deleteSalesAnalyticsSettings(compensation.id)
      return
    }
    await service.updateSalesAnalyticsSettings(compensation.previous as never)
  }
)

export const updateSalesAnalyticsSettingsWorkflow = createWorkflow(
  "update-sales-analytics-settings-workflow",
  function (input: UpdateSalesAnalyticsSettingsInput) {
    const setting = updateSalesAnalyticsSettingsStep(input)
    return new WorkflowResponse(setting)
  }
)
