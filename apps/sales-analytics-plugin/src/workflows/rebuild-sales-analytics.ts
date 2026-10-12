import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { SALES_ANALYTICS_MODULE } from "../modules/sales-analytics"
import type SalesAnalyticsModuleService from "../modules/sales-analytics/service"
import { ORDER_FIELDS, syncOrderProjection } from "./sync-sales-order"

const rebuildSalesAnalyticsStep = createStep(
  "rebuild-sales-analytics",
  async (_input: Record<string, never>, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const service = container.resolve<SalesAnalyticsModuleService>(SALES_ANALYTICS_MODULE)
    const key = "historical-rebuild"
    const existing = (await service.listSalesSyncStates({ sync_key: key }))[0]
    const startedAt = new Date()
    const state = existing
      ? await service.updateSalesSyncStates({
          id: existing.id,
          status: "running",
          last_started_at: startedAt,
          last_error: null,
          processed_count: 0,
        })
      : await service.createSalesSyncStates({
          sync_key: key,
          status: "running",
          last_started_at: startedAt,
          last_completed_at: null,
          last_error: null,
          processed_count: 0,
        })
    let processed = 0
    let skip = 0
    const take = 200
    try {
      while (true) {
        const { data } = await query.graph({
          entity: "order",
          fields: ORDER_FIELDS,
          filters: {},
          pagination: { skip, take, order: { created_at: "ASC" } },
        })
        for (const order of data as Array<{ id: string }>) {
          await syncOrderProjection(container, order.id)
          processed += 1
        }
        if (data.length < take) break
        skip += take
      }
      await service.updateSalesSyncStates({
        id: state.id,
        status: "completed",
        last_completed_at: new Date(),
        processed_count: processed,
        last_error: null,
      })
      return new StepResponse({ processed_count: processed, status: "completed" })
    } catch (error) {
      await service.updateSalesSyncStates({
        id: state.id,
        status: "failed",
        processed_count: processed,
        last_error: error instanceof Error ? error.message.slice(0, 2000) : "Unknown error",
      })
      throw error
    }
  }
)

export const rebuildSalesAnalyticsWorkflow = createWorkflow(
  "rebuild-sales-analytics",
  function () {
    const result = rebuildSalesAnalyticsStep({})
    return new WorkflowResponse(result)
  }
)
