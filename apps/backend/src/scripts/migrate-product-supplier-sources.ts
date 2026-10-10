import type {
  IProductModuleService,
  MedusaContainer,
} from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import { PRODUCT_SUPPLIER_MODULE } from "../modules/product-supplier"
import type ProductSupplierModuleService from "../modules/product-supplier/service"
import { upsertProductSupplierSourceWorkflow } from "../workflows/product-supplier"

const PAGE_SIZE = 100
const LEGACY_KEYS = [
  "supplier_1688_url",
  "supplier_taobao_url",
  "supplier_jd_url",
] as const

type LegacyProduct = {
  id: string
  metadata: Record<string, unknown> | null
}

const metadataUrl = (
  metadata: Record<string, unknown> | null,
  key: (typeof LEGACY_KEYS)[number]
) => (typeof metadata?.[key] === "string" ? metadata[key].trim() || null : null)

export default async function migrateProductSupplierSources({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productService = container.resolve<IProductModuleService>(
    Modules.PRODUCT
  )
  const supplierService =
    container.resolve<ProductSupplierModuleService>(PRODUCT_SUPPLIER_MODULE)
  let skip = 0
  let migrated = 0
  let cleaned = 0

  while (true) {
    const products = (await productService.listProducts(
      {},
      {
        skip,
        take: PAGE_SIZE,
        select: ["id", "metadata"],
        order: { id: "ASC" },
      }
    )) as LegacyProduct[]

    for (const product of products) {
      const hasLegacyMetadata = LEGACY_KEYS.some((key) =>
        Object.prototype.hasOwnProperty.call(product.metadata || {}, key)
      )
      if (!hasLegacyMetadata) {
        continue
      }

      const values = {
        supplier_1688_url: metadataUrl(
          product.metadata,
          "supplier_1688_url"
        ),
        supplier_taobao_url: metadataUrl(
          product.metadata,
          "supplier_taobao_url"
        ),
        supplier_jd_url: metadataUrl(product.metadata, "supplier_jd_url"),
      }

      if (Object.values(values).some(Boolean)) {
        await upsertProductSupplierSourceWorkflow(container).run({
          input: {
            product_id: product.id,
            ...values,
            updated_by: "legacy-migration",
          },
        })

        const [verified] = await supplierService.listProductSupplierSources(
          { product_id: product.id },
          { take: 1 }
        )
        if (
          !verified ||
          verified.supplier_1688_url !== values.supplier_1688_url ||
          verified.supplier_taobao_url !== values.supplier_taobao_url ||
          verified.supplier_jd_url !== values.supplier_jd_url
        ) {
          throw new MedusaError(
            MedusaError.Types.UNEXPECTED_STATE,
            `Supplier source verification failed for product ${product.id}`
          )
        }
        migrated += 1
      }

      const metadata = { ...(product.metadata || {}) }
      for (const key of LEGACY_KEYS) {
        delete metadata[key]
      }
      await updateProductsWorkflow(container).run({
        input: { products: [{ id: product.id, metadata }] },
      })
      cleaned += 1
    }

    if (products.length < PAGE_SIZE) {
      break
    }
    skip += PAGE_SIZE
  }

  logger.info(
    `Product supplier migration complete: ${migrated} migrated, ${cleaned} legacy metadata records cleaned.`
  )
}
