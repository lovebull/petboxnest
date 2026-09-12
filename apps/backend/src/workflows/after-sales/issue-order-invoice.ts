import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils";
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { AFTER_SALES_MODULE } from "../../modules/after-sales";
import type AfterSalesModuleService from "../../modules/after-sales/service";
import { invoiceNumber } from "./helpers";

const issueInvoice = createStep(
  "issue-invoice",
  async (input: { order_id: string }, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const { data } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "customer_id",
        "currency_code",
        "created_at",
        "items.*",
        "shipping_address.*",
        "billing_address.*",
        "subtotal",
        "shipping_total",
        "tax_total",
        "discount_total",
        "total",
      ],
      filters: { id: input.order_id },
    });
    const order = data[0] as any;
    if (!order)
      throw new MedusaError(MedusaError.Types.NOT_FOUND, "Order not found");
    const service =
      container.resolve<AfterSalesModuleService>(AFTER_SALES_MODULE);
    const existing = await service.listOrderInvoices(
      { order_id: order.id },
      { order: { version: "DESC" }, take: 1 },
    );
    if (existing[0]?.status === "issued")
      return new StepResponse(existing[0], { created_id: null });
    const version = (existing[0]?.version || 0) + 1;
    const invoice = await service.createOrderInvoices({
      invoice_number: invoiceNumber(order.display_id, version),
      order_id: order.id,
      customer_id: order.customer_id || null,
      version,
      status: "issued",
      snapshot: order,
      issued_at: new Date(),
      voided_at: null,
    });
    return new StepResponse(invoice, { created_id: invoice.id });
  },
  async (rollback: { created_id: string | null } | undefined, { container }) => {
    if (rollback?.created_id)
      await container
        .resolve<AfterSalesModuleService>(AFTER_SALES_MODULE)
        .deleteOrderInvoices(rollback.created_id);
  },
);

export const issueOrderInvoiceWorkflow = createWorkflow(
  "issue-order-invoice",
  function (input: { order_id: string }) {
    return new WorkflowResponse(issueInvoice(input));
  },
);
