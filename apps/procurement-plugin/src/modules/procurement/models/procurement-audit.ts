import { model } from "@medusajs/framework/utils"

const ProcurementAudit = model
  .define(
    { tableName: "pbn_procurement_audit", name: "ProcurementAudit" },
    {
      id: model.id({ prefix: "paudit" }).primaryKey(),
      entity_type: model.text(),
      entity_id: model.text(),
      action: model.text(),
      admin_user_id: model.text().nullable(),
      previous_values: model.json().nullable(),
      new_values: model.json().nullable(),
      created_at_event: model.dateTime(),
    }
  )
  .indexes([
    { name: "IDX_pbn_procurement_audit_entity", on: ["entity_type", "entity_id", "created_at_event"] },
    { name: "IDX_pbn_procurement_audit_admin", on: ["admin_user_id", "created_at_event"] },
  ])

export default ProcurementAudit
