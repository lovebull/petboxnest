import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import type { UpdateCustomerEmailSchema } from "../../../../../middlewares"
import { updateCustomerEmailWorkflow } from "../../../../../../workflows/update-customer-credentials"

export async function POST(
  req: AuthenticatedMedusaRequest<UpdateCustomerEmailSchema>,
  res: MedusaResponse
) {
  const { result } = await updateCustomerEmailWorkflow(req.scope).run({
    input: {
      customer_id: req.auth_context.actor_id,
      ...req.validatedBody,
    },
  })

  res.json(result)
}
