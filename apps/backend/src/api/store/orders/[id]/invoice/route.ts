import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { retrieveOrderForAfterSales } from "../../../../after-sales-helpers";
import { createInvoicePdf } from "../../../../invoice-pdf";
import { AFTER_SALES_MODULE } from "../../../../../modules/after-sales";
import type AfterSalesModuleService from "../../../../../modules/after-sales/service";
import { issueOrderInvoiceWorkflow } from "../../../../../workflows/after-sales/issue-order-invoice";

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const order = await retrieveOrderForAfterSales(req.scope, req.params.id);
  if (order.customer_id !== req.auth_context.actor_id)
    return res.status(404).json({ message: "Order not found" });
  const service =
    req.scope.resolve<AfterSalesModuleService>(AFTER_SALES_MODULE);
  let [invoice] = await service.listOrderInvoices(
    { order_id: order.id, status: "issued" },
    { order: { version: "DESC" }, take: 1 },
  );
  if (!invoice) {
    const issued = await issueOrderInvoiceWorkflow(req.scope).run({
      input: { order_id: order.id },
    });
    invoice = issued.result as typeof invoice;
  }
  const pdf = createInvoicePdf((invoice as any).snapshot || order);
  if (req.query.format === "json") {
    return res.json({
      filename: `PetBoxNest-order-${order.display_id}.pdf`,
      invoice_number: invoice.invoice_number,
      content_type: "application/pdf",
      base64: pdf.toString("base64"),
    });
  }
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="PetBoxNest-order-${order.display_id}.pdf"`,
  );
  res.setHeader("Cache-Control", "private, no-store");
  res.send(pdf);
}
