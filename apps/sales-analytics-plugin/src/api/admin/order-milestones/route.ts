import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { getOrderMilestoneOverview } from "./presenter";

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const overview = await getOrderMilestoneOverview(
    req.scope,
    req.auth_context.actor_id,
  );
  res.json({ order_milestones: overview });
}
