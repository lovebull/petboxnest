import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import type { IProductModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { PRODUCT_SUPPLIER_MODULE } from "../../../../modules/product-supplier"
import type ProductSupplierModuleService from "../../../../modules/product-supplier/service"
import { upsertProductSupplierSourceWorkflow } from "../../../../workflows/product-supplier"
import type { UpdateProductSupplierSourceBody } from "../validators"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const productService = req.scope.resolve<IProductModuleService>(
    Modules.PRODUCT
  )
  const supplierService =
    req.scope.resolve<ProductSupplierModuleService>(PRODUCT_SUPPLIER_MODULE)
  const product = await productService.retrieveProduct(req.params.productId, {
    relations: ["variants"],
  })
  const [source] = await supplierService.listProductSupplierSources(
    { product_id: product.id },
    { take: 1 }
  )

  return res.json({
    product: {
      id: product.id,
      title: product.title,
      handle: product.handle,
      thumbnail: product.thumbnail,
      variants: (product.variants || []).map((variant) => ({
        id: variant.id,
        title: variant.title,
        sku: variant.sku,
      })),
    },
    supplier_source: source || null,
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest<UpdateProductSupplierSourceBody>,
  res: MedusaResponse
) {
  const { result } = await upsertProductSupplierSourceWorkflow(req.scope).run({
    input: {
      product_id: req.params.productId,
      ...req.validatedBody,
      updated_by: req.auth_context.actor_id,
    },
  })

  return res.json({ supplier_source: result })
}
