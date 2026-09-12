import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { AFTER_SALES_MODULE } from "../../../../../modules/after-sales";
import type AfterSalesModuleService from "../../../../../modules/after-sales/service";
import {
  createAfterSalesRequestWorkflow,
  type CreateAfterSalesInput,
} from "../../../../../workflows/after-sales/create-after-sales-request";
import {
  eligibilityFor,
  requestDetails,
  retrieveOrderForAfterSales,
} from "../../../../after-sales-helpers";

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const order = await retrieveOrderForAfterSales(req.scope, req.params.id);
  if (order.customer_id !== req.auth_context.actor_id)
    return res.status(404).json({ message: "Order not found" });
  const service =
    req.scope.resolve<AfterSalesModuleService>(AFTER_SALES_MODULE);
  const requests = await service.listAfterSalesRequests(
    { order_id: order.id, customer_id: req.auth_context.actor_id },
    { order: { created_at: "DESC" } },
  );
  res.json({
    order,
    eligibility: eligibilityFor(order),
    requests: await Promise.all(
      requests.map((request) => requestDetails(req.scope, request)),
    ),
  });
}

export async function POST(
  req: AuthenticatedMedusaRequest<CreateAfterSalesInput>,
  res: MedusaResponse,
) {
  const { result } = await createAfterSalesRequestWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      order_id: req.params.id,
      customer_id: req.auth_context.actor_id,
    },
  });
  res
    .status(201)
    .json({
      request: await requestDetails(req.scope, (result as any).request),
    });
}
