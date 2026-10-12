import { model } from "@medusajs/framework/utils"

const ProcurementSupplier = model
  .define(
    { tableName: "pbn_procurement_supplier", name: "ProcurementSupplier" },
    {
      id: model.id({ prefix: "psupp" }).primaryKey(),
      code: model.text().unique(),
      name: model.text(),
      status: model.enum(["active", "inactive"]).default("active"),
      contact_name: model.text().nullable(),
      email: model.text().nullable(),
      phone: model.text().nullable(),
      website_url: model.text().nullable(),
      supplier_1688_url: model.text().nullable(),
      supplier_taobao_url: model.text().nullable(),
      supplier_jd_url: model.text().nullable(),
      default_currency_code: model.text().default("usd"),
      payment_terms: model.text().nullable(),
      notes: model.text().nullable(),
      created_by: model.text().nullable(),
      updated_by: model.text().nullable(),
    }
  )
  .indexes([
    { name: "IDX_pbn_procurement_supplier_name", on: ["name"] },
    { name: "IDX_pbn_procurement_supplier_status", on: ["status"] },
  ])

export default ProcurementSupplier
