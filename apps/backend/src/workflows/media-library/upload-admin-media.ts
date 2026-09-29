import type { FileDTO } from "@medusajs/framework/types"
import {
  createStep,
  createWorkflow,
  StepResponse,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import {
  MEDIA_LIBRARY_MODULE,
} from "../../modules/media-library"
import type MediaLibraryModuleService from "../../modules/media-library/service"

export type UploadAdminMediaInput = {
  files: Array<{
    filename: string
    mimeType: string
    content: string
    access: "public" | "private"
    size: number
  }>
  uploaded_by?: string | null
}

type RegisterMediaInput = {
  files: Array<{
    file_key: string
    url: string
    filename: string
    mime_type: string
    size: number
    uploaded_by: string | null
  }>
}

const registerAdminMediaStep = createStep(
  "register-admin-media",
  async (input: RegisterMediaInput, { container }) => {
    if (!input.files.length) {
      return new StepResponse([], [])
    }

    const service = container.resolve<MediaLibraryModuleService>(
      MEDIA_LIBRARY_MODULE
    )
    const assets = await service.createMediaAssets(
      input.files.map((file) => ({
        ...file,
        source: "admin_upload" as const,
      }))
    )

    return new StepResponse(assets, assets.map((asset) => asset.id))
  },
  async (ids: string[] | undefined, { container }) => {
    if (ids?.length) {
      await container
        .resolve<MediaLibraryModuleService>(MEDIA_LIBRARY_MODULE)
        .deleteMediaAssets(ids)
    }
  }
)

export const uploadAdminMediaWorkflow = createWorkflow(
  "upload-admin-media",
  function (input: UploadAdminMediaInput) {
    const uploadInput = transform({ input }, ({ input }) => ({
      files: input.files.map(({ size: _size, ...file }) => file),
    }))
    const uploaded = uploadFilesWorkflow.runAsStep({ input: uploadInput })
    const registrationInput = transform(
      { input, uploaded },
      ({ input, uploaded }) => ({
        files: input.files.flatMap((file, index) => {
          const stored = uploaded[index] as FileDTO | undefined

          if (!file.mimeType.startsWith("image/") || !stored) {
            return []
          }

          return [
            {
              file_key: stored.id,
              url: stored.url,
              filename: file.filename,
              mime_type: file.mimeType,
              size: file.size,
              uploaded_by: input.uploaded_by || null,
            },
          ]
        }),
      })
    )

    registerAdminMediaStep(registrationInput)

    return new WorkflowResponse(uploaded)
  }
)
