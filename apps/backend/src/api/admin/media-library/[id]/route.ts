import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { permanentlyDeleteMediaWorkflow } from "../../../../workflows/media-library"

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { result } = await permanentlyDeleteMediaWorkflow(req.scope).run({
    input: {
      id: req.params.id,
      deleted_by: req.auth_context.actor_id,
    },
  })

  return res.status(200).json(result)
}
