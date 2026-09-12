import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AFTER_SALES_MODULE } from "../../../modules/after-sales";
import type AfterSalesModuleService from "../../../modules/after-sales/service";
import { requestDetails } from "../../after-sales-helpers";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.validatedQuery as {
    page: number;
    limit: number;
    status?: string;
    type?: string;
    q?: string;
  };
  const service =
    req.scope.resolve<AfterSalesModuleService>(AFTER_SALES_MODULE);
  const filters: Record<string, unknown> = {};
  if (query.status) filters.status = query.status;
  if (query.type) filters.type = query.type;
  if (query.q) {
    const pattern = `%${query.q.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`;
    filters.$or = [
      { request_number: { $ilike: pattern } },
      { order_id: { $ilike: pattern } },
      { customer_email: { $ilike: pattern } },
    ];
  }

  const [requests, count] = await service.listAndCountAfterSalesRequests(
    filters,
    {
      take: query.limit,
      skip: (query.page - 1) * query.limit,
      order: { created_at: "DESC" },
    },
  );
  res.json({
    requests,
    count,
    page: query.page,
    page_size: query.limit,
    page_count: Math.max(1, Math.ceil(count / query.limit)),
  });
}
