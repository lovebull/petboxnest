import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { uploadAdminMediaWorkflow } from "../../../workflows/media-library"

type UploadedRequestFile = {
  buffer: Buffer
  mimetype: string
  originalname: string
  size: number
}

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const files = (
    req as AuthenticatedMedusaRequest & { files?: UploadedRequestFile[] }
  ).files

  if (!files?.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "No files were uploaded"
    )
  }

  const { result } = await uploadAdminMediaWorkflow(req.scope).run({
    input: {
      files: files.map((file) => ({
        filename: file.originalname,
        mimeType: file.mimetype,
        content: file.buffer.toString("base64"),
        access: "public",
        size: file.size,
      })),
      uploaded_by: req.auth_context.actor_id,
    },
  })

  return res.status(200).json({ files: result })
}
