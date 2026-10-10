import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import type { IProductModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { PRODUCT_SUPPLIER_MODULE } from "../../../modules/product-supplier"
import type ProductSupplierModuleService from "../../../modules/product-supplier/service"
import type { ProductSupplierSourceListQuery } from "./validators"

type SourceRecord = {
  id: string
  product_id: string
  supplier_1688_url: string | null
  supplier_taobao_url: string | null
  supplier_jd_url: string | null
  updated_by: string | null
  created_at: Date | string
  updated_at: Date | string
}

const isConfigured = (
  source: SourceRecord,
  provider: ProductSupplierSourceListQuery["provider"]
) => {
  if (provider === "1688") {
    return Boolean(source.supplier_1688_url)
  }
  if (provider === "taobao") {
    return Boolean(source.supplier_taobao_url)
  }
  if (provider === "jd") {
    return Boolean(source.supplier_jd_url)
  }

  return Boolean(
    source.supplier_1688_url ||
      source.supplier_taobao_url ||
      source.supplier_jd_url
  )
}

const listAllSources = async (service: ProductSupplierModuleService) => {
  const sources: SourceRecord[] = []
  const take = 500
  let skip = 0

  while (true) {
    const page = (await service.listProductSupplierSources(
      {},
      { skip, take, order: { id: "ASC" } }
    )) as SourceRecord[]
    sources.push(...page)

    if (page.length < take) {
      return sources
    }
    skip += take
  }
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { page, limit, q, provider, status } =
    req.validatedQuery as ProductSupplierSourceListQuery
  const productService = req.scope.resolve<IProductModuleService>(
    Modules.PRODUCT
  )
  const supplierService =
    req.scope.resolve<ProductSupplierModuleService>(PRODUCT_SUPPLIER_MODULE)

  const allSources = await listAllSources(supplierService)
  const matchingSourceProductIds = allSources
    .filter((source) => isConfigured(source, provider))
    .map((source) => source.product_id)
  const shouldFilterConfigured = status === "configured" || provider !== "all"
  const filters: Record<string, unknown> = {}

  if (q) {
    filters.q = q
  }

  if (status === "missing") {
    if (matchingSourceProductIds.length) {
      filters.id = { $nin: matchingSourceProductIds }
    }
  } else if (shouldFilterConfigured) {
    if (!matchingSourceProductIds.length) {
      return res.json({
        products: [],
        count: 0,
        page,
        page_count: 1,
        page_size: limit,
      })
    }
    filters.id = { $in: matchingSourceProductIds }
  }

  const [products, count] = await productService.listAndCountProducts(
    filters,
    {
      skip: (page - 1) * limit,
      take: limit,
      order: { updated_at: "DESC" },
      relations: ["variants"],
    }
  )
  const sourceMap = new Map(
    allSources.map((source) => [source.product_id, source])
  )

  return res.json({
    products: products.map((product) => ({
      id: product.id,
      title: product.title,
      handle: product.handle,
      thumbnail: product.thumbnail,
      status: product.status,
      variants: (product.variants || []).map((variant) => ({
        id: variant.id,
        title: variant.title,
        sku: variant.sku,
      })),
      supplier_source: sourceMap.get(product.id) || null,
    })),
    count,
    page,
    page_count: Math.max(1, Math.ceil(count / limit)),
    page_size: limit,
  })
}
