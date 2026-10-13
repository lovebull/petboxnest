import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { dismissOrderMilestoneWorkflow } from "../../../../../workflows";

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const { result } = await dismissOrderMilestoneWorkflow(req.scope).run({
    input: {
      milestone_id: req.params.id,
      admin_user_id: req.auth_context.actor_id,
    },
  });
  res.json({ acknowledgement: result });
}
