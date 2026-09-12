import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { createAfterSalesUploadUrls } from "../../../../../after-sales-uploads"
import { retrieveOrderForAfterSales } from "../../../../../after-sales-helpers"

type Body = {
  files: Array<{ name: string; mime_type: string; size: number }>
}

export async function POST(
  req: AuthenticatedMedusaRequest<Body>,
  res: MedusaResponse,
) {
  const order = await retrieveOrderForAfterSales(req.scope, req.params.id)
  if (order.customer_id !== req.auth_context.actor_id) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "This order does not belong to the customer",
    )
  }
  res.json({
    uploads: await createAfterSalesUploadUrls(
      req.scope,
      req.validatedBody.files,
    ),
  })
}
