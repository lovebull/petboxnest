import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CHECKOUT_ERROR_MODULE } from "../../../modules/checkout-error"
import type CheckoutErrorModuleService from "../../../modules/checkout-error/service"
import { STOREFRONT_ERROR_MODULE } from "../../../modules/storefront-error"
import type StorefrontErrorModuleService from "../../../modules/storefront-error/service"

type Query = {
  page: number
  limit: number
  q?: string
  kind: "all" | "checkout" | "route"
  resource?: string
  scope?: string
  resolution_status?: string
  retryable?: boolean
  date_from?: string
  date_to?: string
}

const dateFilter = (query: Query) =>
  query.date_from || query.date_to
    ? {
        ...(query.date_from ? { $gte: new Date(query.date_from) } : {}),
        ...(query.date_to ? { $lte: new Date(query.date_to) } : {}),
      }
    : undefined

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const query = req.validatedQuery as Query
  const checkoutService = req.scope.resolve<CheckoutErrorModuleService>(CHECKOUT_ERROR_MODULE)
  const storefrontService = req.scope.resolve<StorefrontErrorModuleService>(STOREFRONT_ERROR_MODULE)
  const common: Record<string, unknown> = {}
  if (query.resolution_status) common.resolution_status = query.resolution_status
  if (typeof query.retryable === "boolean") common.retryable = query.retryable
  const occurredAt = dateFilter(query)
  if (occurredAt) common.occurred_at = occurredAt

  const checkoutFilters: Record<string, unknown> = { ...common }
  const routeFilters: Record<string, unknown> = { ...common }
  if (query.resource) checkoutFilters.resource = query.resource
  if (query.scope) routeFilters.scope = query.scope
  if (query.q) {
    const [checkoutIds, routeIds] = await Promise.all([
      checkoutService.searchCheckoutErrorIds(query.q),
      storefrontService.searchStorefrontErrorIds(query.q),
    ])
    checkoutFilters.id = checkoutIds.length ? checkoutIds : "__no_checkout_match__"
    routeFilters.id = routeIds.length ? routeIds : "__no_route_match__"
  }

  const includeCheckout = query.kind !== "route" && !query.scope
  const includeRoute = query.kind !== "checkout" && !query.resource
  const take = query.page * query.limit
  const [checkoutResult, routeResult, checkoutSummary, routeSummary] = await Promise.all([
    includeCheckout
      ? checkoutService.listAndCountCheckoutErrors(checkoutFilters as never, {
          take,
          skip: 0,
          order: { occurred_at: "DESC" },
        })
      : Promise.resolve([[], 0] as [never[], number]),
    includeRoute
      ? storefrontService.listAndCountStorefrontErrors(routeFilters as never, {
          take,
          skip: 0,
          order: { occurred_at: "DESC" },
        })
      : Promise.resolve([[], 0] as [never[], number]),
    includeCheckout ? checkoutService.getCheckoutErrorSummary() : Promise.resolve({ total: 0, open: 0, resolved: 0, ignored: 0 }),
    includeRoute ? storefrontService.getStorefrontErrorSummary() : Promise.resolve({ total: 0, open: 0, resolved: 0, ignored: 0 }),
  ])
  const [checkoutErrors, checkoutCount] = checkoutResult
  const [routeErrors, routeCount] = routeResult
  const normalized = [
    ...checkoutErrors.map((error) => ({ ...error, kind: "checkout" as const })),
    ...routeErrors.map((error) => ({ ...error, kind: "route" as const, resource: "route_render" as const })),
  ]
    .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
    .slice((query.page - 1) * query.limit, query.page * query.limit)
  const count = checkoutCount + routeCount
  res.json({
    errors: normalized,
    count,
    page: query.page,
    page_size: query.limit,
    page_count: Math.max(1, Math.ceil(count / query.limit)),
    summary: {
      total: checkoutSummary.total + routeSummary.total,
      open: checkoutSummary.open + routeSummary.open,
      resolved: checkoutSummary.resolved + routeSummary.resolved,
      ignored: checkoutSummary.ignored + routeSummary.ignored,
    },
  })
}
