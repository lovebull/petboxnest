import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import type { UpdateCustomerPasswordSchema } from "../../../../../middlewares"
import { updateCustomerPasswordWorkflow } from "../../../../../../workflows/update-customer-credentials"

export async function POST(
  req: AuthenticatedMedusaRequest<UpdateCustomerPasswordSchema>,
  res: MedusaResponse
) {
  const { result } = await updateCustomerPasswordWorkflow(req.scope).run({
    input: {
      customer_id: req.auth_context.actor_id,
      ...req.validatedBody,
    },
  })

  res.json(result)
}
