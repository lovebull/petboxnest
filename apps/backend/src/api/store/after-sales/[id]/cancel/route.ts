import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { cancelAfterSalesRequestWorkflow } from "../../../../../workflows/after-sales/cancel-after-sales-request";
import { requestDetails } from "../../../../after-sales-helpers";

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const { result } = await cancelAfterSalesRequestWorkflow(req.scope).run({
    input: { id: req.params.id, customer_id: req.auth_context.actor_id },
  });
  res.json({
    request: await requestDetails(req.scope, (result as any).request),
  });
}
