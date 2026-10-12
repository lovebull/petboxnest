import { MedusaError } from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { PROCUREMENT_MODULE } from "../modules/procurement"
import type ProcurementModuleService from "../modules/procurement/service"
import type { SupplierInput } from "../types"

const optionalText = (value?: string | null) => value?.trim() || null
const currency = (value?: string) => (value || "usd").trim().toLowerCase()
const supplierCode = () =>
  `SUP-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`

type Compensation =
  | { action: "delete"; id: string; audit_id: string }
  | { action: "restore"; previous: Record<string, unknown>; audit_id: string }

const upsertSupplierStep = createStep(
  "upsert-procurement-supplier",
  async (input: SupplierInput, { container }) => {
    const service = container.resolve<ProcurementModuleService>(PROCUREMENT_MODULE)
    const name = input.name.trim()
    if (!name) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Supplier name is required")
    }

    const values = {
      code: input.code?.trim() || supplierCode(),
      name,
      status: input.status || ("active" as const),
      contact_name: optionalText(input.contact_name),
      email: optionalText(input.email)?.toLowerCase() || null,
      phone: optionalText(input.phone),
      website_url: optionalText(input.website_url),
      supplier_1688_url: optionalText(input.supplier_1688_url),
      supplier_taobao_url: optionalText(input.supplier_taobao_url),
      supplier_jd_url: optionalText(input.supplier_jd_url),
      default_currency_code: currency(input.default_currency_code),
      payment_terms: optionalText(input.payment_terms),
      notes: optionalText(input.notes),
      updated_by: input.admin_user_id || null,
    }

    if (input.id) {
      const previous = await service.retrieveProcurementSupplier(input.id)
      const supplier = await service.updateProcurementSuppliers({
        id: input.id,
        ...values,
      })
      const [audit] = await service.createProcurementAudits([
        {
          entity_type: "supplier",
          entity_id: input.id,
          action: "updated",
          admin_user_id: input.admin_user_id || null,
          previous_values: previous,
          new_values: supplier,
          created_at_event: new Date(),
        },
      ])
      return new StepResponse(
        supplier,
        {
          action: "restore",
          previous: previous as unknown as Record<string, unknown>,
          audit_id: audit.id,
        } satisfies Compensation
      )
    }

    const [supplier] = await service.createProcurementSuppliers([
      { ...values, created_by: input.admin_user_id || null },
    ])
    const [audit] = await service.createProcurementAudits([
      {
        entity_type: "supplier",
        entity_id: supplier.id,
        action: "created",
        admin_user_id: input.admin_user_id || null,
        previous_values: null,
        new_values: supplier,
        created_at_event: new Date(),
      },
    ])
    return new StepResponse(
      supplier,
      { action: "delete", id: supplier.id, audit_id: audit.id } satisfies Compensation
    )
  },
  async (compensation: Compensation | undefined, { container }) => {
    if (!compensation) return
    const service = container.resolve<ProcurementModuleService>(PROCUREMENT_MODULE)
    await service.deleteProcurementAudits(compensation.audit_id)
    if (compensation.action === "delete") {
      await service.deleteProcurementSuppliers(compensation.id)
      return
    }
    await service.updateProcurementSuppliers(compensation.previous as never)
  }
)

export const upsertProcurementSupplierWorkflow = createWorkflow(
  "upsert-procurement-supplier",
  function (input: SupplierInput) {
    const supplier = upsertSupplierStep(input)
    return new WorkflowResponse(supplier)
  }
)
