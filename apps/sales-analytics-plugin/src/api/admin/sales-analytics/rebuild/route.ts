import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { requestSalesAnalyticsRebuildWorkflow } from "../../../../workflows";

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const { result } = await requestSalesAnalyticsRebuildWorkflow(req.scope).run({
    input: {},
  });
  res.status(202).json(result);
}
