import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AFTER_SALES_MODULE } from "../../../../modules/after-sales";
import type AfterSalesModuleService from "../../../../modules/after-sales/service";
import {
  requestDetails,
  retrieveOrderForAfterSales,
} from "../../../after-sales-helpers";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service =
    req.scope.resolve<AfterSalesModuleService>(AFTER_SALES_MODULE);
  const request = await service.retrieveAfterSalesRequest(req.params.id);
  res.json({
    request: await requestDetails(req.scope, request, true),
    order: await retrieveOrderForAfterSales(req.scope, request.order_id),
  });
}
