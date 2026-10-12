import { MedusaService } from "@medusajs/framework/utils"
import {
  ProcurementAudit,
  ProcurementSupplier,
  PurchaseOrder,
  PurchaseOrderItem,
  PurchasePayment,
  PurchaseReceipt,
  PurchaseReceiptItem,
} from "./models"

class ProcurementModuleService extends MedusaService({
  ProcurementSupplier,
  PurchaseOrder,
  PurchaseOrderItem,
  PurchasePayment,
  PurchaseReceipt,
  PurchaseReceiptItem,
  ProcurementAudit,
}) {}

export default ProcurementModuleService
