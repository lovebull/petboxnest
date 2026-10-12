import { MedusaError } from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { PROCUREMENT_MODULE } from "../modules/procurement"
import type ProcurementModuleService from "../modules/procurement/service"
import { roundAmount } from "../modules/procurement/utils"
import type { PurchaseOrderInput } from "../types"

const optionalText = (value?: string | null) => value?.trim() || null
const asDate = (value?: string | null) => (value ? new Date(value) : null)
const orderNumber = () =>
  `PO-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Date.now()
    .toString(36)
    .slice(-6)
    .toUpperCase()}`

type PreviousOrder = Record<string, unknown> & { id: string }
type PreviousItem = Record<string, unknown> & { id: string }
type Compensation =
  | { action: "delete"; order_id: string; item_ids: string[]; audit_id: string }
  | {
      action: "restore"
      previous_order: PreviousOrder
      previous_items: PreviousItem[]
      new_item_ids: string[]
      audit_id: string
    }

const upsertPurchaseOrderStep = createStep(
  "upsert-purchase-order",
  async (input: PurchaseOrderInput, { container }) => {
    const service = container.resolve<ProcurementModuleService>(PROCUREMENT_MODULE)
    if (!input.items.length) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "At least one item is required")
    }
    for (const item of input.items) {
      if (!item.product_title.trim()) {
        throw new MedusaError(MedusaError.Types.INVALID_DATA, "Item title is required")
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0 || item.unit_cost < 0) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Item quantity must be a positive integer and unit cost cannot be negative"
        )
      }
    }

    const supplier = await service.retrieveProcurementSupplier(input.supplier_id)
    if (supplier.status !== "active") {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Inactive supplier cannot be used")
    }

    const exchangeRate = input.exchange_rate ?? 1
    const shipping = roundAmount(input.shipping_amount ?? 0)
    const tax = roundAmount(input.tax_amount ?? 0)
    const discount = roundAmount(input.discount_amount ?? 0)
    const other = roundAmount(input.other_amount ?? 0)
    if (exchangeRate <= 0 || [shipping, tax, discount, other].some((value) => value < 0)) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Amounts and exchange rate are invalid")
    }
    const preparedItems = input.items.map((item) => ({
      product_id: optionalText(item.product_id),
      variant_id: optionalText(item.variant_id),
      sku: optionalText(item.sku),
      product_title: item.product_title.trim(),
      variant_title: optionalText(item.variant_title),
      supplier_sku: optionalText(item.supplier_sku),
      supplier_url: optionalText(item.supplier_url),
      quantity: item.quantity,
      received_quantity: 0,
      unit_cost: roundAmount(item.unit_cost),
      line_total: roundAmount(item.quantity * item.unit_cost),
      notes: optionalText(item.notes),
    }))
    const subtotal = roundAmount(
      preparedItems.reduce((sum, item) => sum + item.line_total, 0)
    )
    const total = roundAmount(subtotal + shipping + tax + other - discount)
    if (total < 0) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Order total cannot be negative")
    }

    const common = {
      supplier_id: supplier.id,
      supplier_name: supplier.name,
      currency_code: input.currency_code.trim().toLowerCase(),
      base_currency_code: (input.base_currency_code || "usd").trim().toLowerCase(),
      exchange_rate: exchangeRate,
      subtotal,
      shipping_amount: shipping,
      tax_amount: tax,
      discount_amount: discount,
      other_amount: other,
      total_amount: total,
      base_total_amount: roundAmount(total * exchangeRate),
      ordered_at: asDate(input.ordered_at),
      expected_at: asDate(input.expected_at),
      notes: optionalText(input.notes),
      updated_by: input.admin_user_id || null,
    }

    let order: Awaited<ReturnType<typeof service.retrievePurchaseOrder>>
    let compensation: Compensation
    if (input.id) {
      const previous = await service.retrievePurchaseOrder(input.id)
      if (previous.status !== "draft") {
        throw new MedusaError(
          MedusaError.Types.NOT_ALLOWED,
          "Only draft purchase orders can be edited"
        )
      }
      const previousItems = await service.listPurchaseOrderItems({ order_id: input.id })
      if (previousItems.length) {
        await service.deletePurchaseOrderItems(previousItems.map((item) => item.id))
      }
      order = await service.updatePurchaseOrders({ id: input.id, ...common })
      const createdItems = await service.createPurchaseOrderItems(
        preparedItems.map((item) => ({ ...item, order_id: input.id! }))
      )
      const [audit] = await service.createProcurementAudits([
        {
          entity_type: "purchase_order",
          entity_id: input.id,
          action: "updated",
          admin_user_id: input.admin_user_id || null,
          previous_values: { order: previous, items: previousItems },
          new_values: { order, items: createdItems },
          created_at_event: new Date(),
        },
      ])
      compensation = {
        action: "restore",
        previous_order: previous as unknown as PreviousOrder,
        previous_items: previousItems as unknown as PreviousItem[],
        new_item_ids: createdItems.map((item) => item.id),
        audit_id: audit.id,
      }
    } else {
      const [created] = await service.createPurchaseOrders([
        {
          order_number: input.order_number?.trim() || orderNumber(),
          ...common,
          status: "draft",
          payment_status: "unpaid",
          paid_amount: 0,
          outstanding_amount: total,
          received_at: null,
          created_by: input.admin_user_id || null,
        },
      ])
      order = created
      const createdItems = await service.createPurchaseOrderItems(
        preparedItems.map((item) => ({ ...item, order_id: created.id }))
      )
      const [audit] = await service.createProcurementAudits([
        {
          entity_type: "purchase_order",
          entity_id: created.id,
          action: "created",
          admin_user_id: input.admin_user_id || null,
          previous_values: null,
          new_values: { order: created, items: createdItems },
          created_at_event: new Date(),
        },
      ])
      compensation = {
        action: "delete",
        order_id: created.id,
        item_ids: createdItems.map((item) => item.id),
        audit_id: audit.id,
      }
    }

    const items = await service.listPurchaseOrderItems({ order_id: order.id })
    return new StepResponse({ ...order, items }, compensation)
  },
  async (compensation: Compensation | undefined, { container }) => {
    if (!compensation) return
    const service = container.resolve<ProcurementModuleService>(PROCUREMENT_MODULE)
    await service.deleteProcurementAudits(compensation.audit_id)
    if (compensation.action === "delete") {
      if (compensation.item_ids.length) {
        await service.deletePurchaseOrderItems(compensation.item_ids)
      }
      await service.deletePurchaseOrders(compensation.order_id)
      return
    }
    if (compensation.new_item_ids.length) {
      await service.deletePurchaseOrderItems(compensation.new_item_ids)
    }
    await service.updatePurchaseOrders(compensation.previous_order as never)
    if (compensation.previous_items.length) {
      await service.createPurchaseOrderItems(compensation.previous_items as never)
    }
  }
)

export const upsertPurchaseOrderWorkflow = createWorkflow(
  "upsert-purchase-order",
  function (input: PurchaseOrderInput) {
    const order = upsertPurchaseOrderStep(input)
    return new WorkflowResponse(order)
  }
)
