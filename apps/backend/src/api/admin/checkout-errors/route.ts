import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { CHECKOUT_ERROR_MODULE } from "../../../modules/checkout-error"
import type CheckoutErrorModuleService from "../../../modules/checkout-error/service"

type Query = {
  page: number
  limit: number
  q?: string
  resource?: string
  resolution_status?: string
  retryable?: boolean
  date_from?: string
  date_to?: string
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const query = req.validatedQuery as Query
  const service = req.scope.resolve<CheckoutErrorModuleService>(
    CHECKOUT_ERROR_MODULE
  )
  const filters: Record<string, unknown> = {}
  if (query.resource) filters.resource = query.resource
  if (query.resolution_status) {
    filters.resolution_status = query.resolution_status
  }
  if (typeof query.retryable === "boolean") filters.retryable = query.retryable
  if (query.date_from || query.date_to) {
    filters.occurred_at = {
      ...(query.date_from ? { $gte: new Date(query.date_from) } : {}),
      ...(query.date_to ? { $lte: new Date(query.date_to) } : {}),
    }
  }
  if (query.q) {
    const ids = await service.searchCheckoutErrorIds(query.q)
    filters.id = ids.length ? ids : "__no_matching_checkout_error__"
  }
  const [errors, count] = await service.listAndCountCheckoutErrors(
    filters as never,
    {
      take: query.limit,
      skip: (query.page - 1) * query.limit,
      order: { occurred_at: "DESC" },
    }
  )
  const summary = await service.getCheckoutErrorSummary()
  res.json({
    errors,
    count,
    page: query.page,
    page_size: query.limit,
    page_count: Math.max(1, Math.ceil(count / query.limit)),
    summary,
  })
}
