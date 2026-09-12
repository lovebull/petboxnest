import { MedusaService } from "@medusajs/framework/utils";
import {
  AfterSalesAttachment,
  AfterSalesItem,
  AfterSalesRequest,
  AfterSalesStatusHistory,
  GuestAccessCode,
  OrderInvoice,
} from "./models";

class AfterSalesModuleService extends MedusaService({
  AfterSalesRequest,
  AfterSalesItem,
  AfterSalesAttachment,
  AfterSalesStatusHistory,
  GuestAccessCode,
  OrderInvoice,
}) {}

export default AfterSalesModuleService;
