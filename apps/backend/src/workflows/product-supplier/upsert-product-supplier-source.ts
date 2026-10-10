import type { IProductModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  StepResponse,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows"
import {
  PRODUCT_SUPPLIER_MODULE,
} from "../../modules/product-supplier"
import type ProductSupplierModuleService from "../../modules/product-supplier/service"

export type UpsertProductSupplierSourceInput = {
  product_id: string
  supplier_1688_url?: string | null
  supplier_taobao_url?: string | null
  supplier_jd_url?: string | null
  updated_by?: string | null
}

type SupplierValues = Omit<UpsertProductSupplierSourceInput, "product_id">

type ProductSupplierSourceRecord = SupplierValues & {
  id: string
  product_id: string
}

type UpsertCompensation =
  | { action: "delete"; id: string }
  | { action: "restore"; previous: ProductSupplierSourceRecord }

const normalizeUrl = (value?: string | null) => value?.trim() || null

const upsertProductSupplierSourceStep = createStep(
  "upsert-product-supplier-source",
  async (input: UpsertProductSupplierSourceInput, { container }) => {
    const productService = container.resolve<IProductModuleService>(
      Modules.PRODUCT
    )
    const supplierService =
      container.resolve<ProductSupplierModuleService>(PRODUCT_SUPPLIER_MODULE)

    await productService.retrieveProduct(input.product_id, {
      select: ["id"],
    })

    const values: SupplierValues = {
      supplier_1688_url: normalizeUrl(input.supplier_1688_url),
      supplier_taobao_url: normalizeUrl(input.supplier_taobao_url),
      supplier_jd_url: normalizeUrl(input.supplier_jd_url),
      updated_by: input.updated_by || null,
    }
    const [existing] = (await supplierService.listProductSupplierSources(
      { product_id: input.product_id },
      { take: 1 }
    )) as ProductSupplierSourceRecord[]

    if (existing) {
      const source = await supplierService.updateProductSupplierSources({
        id: existing.id,
        ...values,
      })

      return new StepResponse(
        { source, created: false },
        { action: "restore", previous: existing } satisfies UpsertCompensation
      )
    }

    const [source] = await supplierService.createProductSupplierSources([
      {
        product_id: input.product_id,
        ...values,
      },
    ])

    return new StepResponse(
      { source, created: true },
      { action: "delete", id: source.id } satisfies UpsertCompensation
    )
  },
  async (compensation: UpsertCompensation | undefined, { container }) => {
    if (!compensation) {
      return
    }

    const supplierService =
      container.resolve<ProductSupplierModuleService>(PRODUCT_SUPPLIER_MODULE)

    if (compensation.action === "delete") {
      await supplierService.deleteProductSupplierSources(compensation.id)
      return
    }

    await supplierService.updateProductSupplierSources({
      id: compensation.previous.id,
      supplier_1688_url: compensation.previous.supplier_1688_url,
      supplier_taobao_url: compensation.previous.supplier_taobao_url,
      supplier_jd_url: compensation.previous.supplier_jd_url,
      updated_by: compensation.previous.updated_by,
    })
  }
)

export const upsertProductSupplierSourceWorkflow = createWorkflow(
  "upsert-product-supplier-source",
  function (input: UpsertProductSupplierSourceInput) {
    const upserted = upsertProductSupplierSourceStep(input)
    const links = transform({ input, upserted }, ({ input, upserted }) => {
      if (!upserted.created) {
        return []
      }

      return [
        {
          [Modules.PRODUCT]: { product_id: input.product_id },
          [PRODUCT_SUPPLIER_MODULE]: {
            product_supplier_source_id: upserted.source.id,
          },
        },
      ]
    })

    createRemoteLinkStep(links)

    const source = transform({ upserted }, ({ upserted }) => upserted.source)

    return new WorkflowResponse(source)
  }
)
