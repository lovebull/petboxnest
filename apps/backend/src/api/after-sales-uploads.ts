import { randomUUID } from "node:crypto"
import { extname } from "node:path"
import { MedusaError, Modules } from "@medusajs/framework/utils"

type UploadInput = { name: string; mime_type: string; size: number }

const extensionByMime: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

export async function createAfterSalesUploadUrls(
  scope: any,
  files: UploadInput[],
) {
  const publicBase = process.env.S3_FILE_URL?.replace(/\/$/, "")
  if (!publicBase) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Evidence uploads are not configured",
    )
  }

  const fileService = scope.resolve(Modules.FILE) as any
  return Promise.all(
    files.map(async (file) => {
      const suppliedExtension = extname(file.name).slice(1).toLowerCase()
      const safeExtension = extensionByMime[file.mime_type]
      if (!safeExtension || (suppliedExtension && suppliedExtension !== safeExtension && !(file.mime_type === "image/jpeg" && suppliedExtension === "jpeg"))) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `File extension does not match ${file.mime_type}`,
        )
      }
      const filename = `after-sales/${randomUUID()}.${safeExtension}`
      const signed = await fileService.getUploadFileUrls({
        filename,
        mimeType: file.mime_type,
        access: "public",
      })
      return {
        upload_url: signed.url,
        file_url: `${publicBase}/${signed.key}`,
        mime_type: file.mime_type,
        size: file.size,
      }
    }),
  )
}
