import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MEDIA_LIBRARY_MODULE } from "../../../modules/media-library"
import type MediaLibraryModuleService from "../../../modules/media-library/service"

type MediaLibraryQuery = {
  limit: number
  page: number
  q?: string
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { limit, page, q } = req.validatedQuery as MediaLibraryQuery
  const service = req.scope.resolve<MediaLibraryModuleService>(
    MEDIA_LIBRARY_MODULE
  )
  const filters = q
    ? {
        $or: [
          { filename: { $ilike: `%${q}%` } },
          { file_key: { $ilike: `%${q}%` } },
        ],
      }
    : {}
  const [assets, count] = await service.listAndCountMediaAssets(
    filters,
    {
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: "DESC" },
    }
  )

  return res.status(200).json({
    media: assets,
    count,
    page,
    page_count: Math.max(1, Math.ceil(count / limit)),
    page_size: limit,
  })
}
