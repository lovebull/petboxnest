import { model } from "@medusajs/framework/utils"

const ProductSupplierSource = model
  .define(
    {
      tableName: "pbn_product_supplier_source",
      name: "ProductSupplierSource",
    },
    {
      id: model.id({ prefix: "psrc" }).primaryKey(),
      product_id: model.text().unique(),
      supplier_1688_url: model.text().nullable(),
      supplier_taobao_url: model.text().nullable(),
      supplier_jd_url: model.text().nullable(),
      updated_by: model.text().nullable(),
    }
  )
  .indexes([
    {
      name: "IDX_pbn_product_supplier_source_updated_at",
      on: ["updated_at"],
    },
  ])

export default ProductSupplierSource
