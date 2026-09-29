import { MedusaError } from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  MEDIA_LIBRARY_MODULE,
} from "../../modules/media-library"
import { deleteS3ObjectAndVerify } from "../../modules/media-library/s3"
import type MediaLibraryModuleService from "../../modules/media-library/service"
import { getMediaReferencesByUrl } from "../../utils/media-library-references"

export type PermanentlyDeleteMediaInput = {
  id: string
  deleted_by?: string | null
}

const permanentlyDeleteMediaStep = createStep(
  {
    name: "permanently-delete-media",
    noCompensation: true,
  },
  async (input: PermanentlyDeleteMediaInput, { container }) => {
    const service = container.resolve<MediaLibraryModuleService>(
      MEDIA_LIBRARY_MODULE
    )
    const asset = await service.retrieveMediaAsset(input.id)
    const references = await getMediaReferencesByUrl(container, [asset.url])

    if (!references[asset.url]?.is_orphan) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "This image is still used by a product or variant. Remove every reference before permanently deleting it."
      )
    }

    await deleteS3ObjectAndVerify(asset.file_key)
    await service.deleteMediaAssets(asset.id)

    return new StepResponse({
      id: asset.id,
      file_key: asset.file_key,
      deleted: true,
      deleted_by: input.deleted_by || null,
    })
  },
  async () => {}
)

export const permanentlyDeleteMediaWorkflow = createWorkflow(
  "permanently-delete-media",
  function (input: PermanentlyDeleteMediaInput) {
    return new WorkflowResponse(permanentlyDeleteMediaStep(input))
  }
)
