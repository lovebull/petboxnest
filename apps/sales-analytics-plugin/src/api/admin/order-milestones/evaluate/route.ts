import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { evaluateOrderMilestonesWorkflow } from "../../../../workflows";
import { getOrderMilestoneOverview } from "../presenter";

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  await evaluateOrderMilestonesWorkflow(req.scope).run({ input: {} });
  const overview = await getOrderMilestoneOverview(
    req.scope,
    req.auth_context.actor_id,
  );
  res.json({ order_milestones: overview });
}
