import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createAfterSalesUploadUrls } from "../../../../after-sales-uploads"
import { requireGuestAccess } from "../../../../after-sales-helpers"

type Body = {
  order_id: string
  guest_access_token: string
  files: Array<{ name: string; mime_type: string; size: number }>
}

export async function POST(req: MedusaRequest<Body>, res: MedusaResponse) {
  await requireGuestAccess(
    req.scope,
    req.validatedBody.order_id,
    req.validatedBody.guest_access_token,
  )
  res.json({
    uploads: await createAfterSalesUploadUrls(
      req.scope,
      req.validatedBody.files,
    ),
  })
}
