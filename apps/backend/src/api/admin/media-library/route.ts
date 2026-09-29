import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MEDIA_LIBRARY_MODULE } from "../../../modules/media-library"
import type MediaLibraryModuleService from "../../../modules/media-library/service"
import {
  collectReferencedMediaUrls,
  getMediaReferencesByUrl,
} from "../../../utils/media-library-references"
import type { MediaLibraryListQuery } from "./validators"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { limit, page, q, usage } =
    req.validatedQuery as MediaLibraryListQuery
  const service = req.scope.resolve<MediaLibraryModuleService>(
    MEDIA_LIBRARY_MODULE
  )
  const filters: Record<string, unknown> = q
    ? {
        $or: [
          { filename: { $ilike: `%${q}%` } },
          { file_key: { $ilike: `%${q}%` } },
        ],
      }
    : {}

  if (usage !== "all") {
    const referencedUrls = [...(await collectReferencedMediaUrls(req.scope))]

    if (usage === "referenced" && !referencedUrls.length) {
      return res.status(200).json({
        media: [],
        count: 0,
        page,
        page_count: 1,
        page_size: limit,
      })
    }

    if (referencedUrls.length) {
      filters.url =
        usage === "referenced"
          ? { $in: referencedUrls }
          : { $nin: referencedUrls }
    }
  }

  const [assets, count] = await service.listAndCountMediaAssets(
    filters as never,
    {
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: "DESC" },
    }
  )
  const references = await getMediaReferencesByUrl(
    req.scope,
    assets.map((asset) => asset.url)
  )

  return res.status(200).json({
    media: assets.map((asset) => ({
      ...asset,
      references: references[asset.url],
    })),
    count,
    page,
    page_count: Math.max(1, Math.ceil(count / limit)),
    page_size: limit,
  })
}
