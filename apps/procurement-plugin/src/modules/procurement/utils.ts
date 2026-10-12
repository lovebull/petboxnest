import type ProcurementModuleService from "./service"

export const toNumber = (value: unknown) => {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

export const roundAmount = (value: number) =>
  Math.round((value + Number.EPSILON) * 10000) / 10000

export async function retrievePurchaseOrderDetail(
  service: ProcurementModuleService,
  orderId: string
) {
  const order = await service.retrievePurchaseOrder(orderId)
  const [items, payments, receipts, audits] = await Promise.all([
    service.listPurchaseOrderItems(
      { order_id: orderId },
      { order: { created_at: "ASC" } }
    ),
    service.listPurchasePayments(
      { order_id: orderId },
      { order: { paid_at: "DESC" } }
    ),
    service.listPurchaseReceipts(
      { order_id: orderId },
      { order: { received_at: "DESC" } }
    ),
    service.listProcurementAudits(
      { entity_type: "purchase_order", entity_id: orderId },
      { order: { created_at_event: "DESC" } }
    ),
  ])
  const receiptIds = receipts.map((receipt) => receipt.id)
  const receiptItems = receiptIds.length
    ? await service.listPurchaseReceiptItems({ receipt_id: receiptIds })
    : []

  return {
    ...order,
    items,
    payments,
    receipts: receipts.map((receipt) => ({
      ...receipt,
      items: receiptItems.filter((item) => item.receipt_id === receipt.id),
    })),
    audits,
  }
}
