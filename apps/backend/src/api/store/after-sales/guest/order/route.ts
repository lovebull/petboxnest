import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { AFTER_SALES_MODULE } from "../../../../../modules/after-sales";
import type AfterSalesModuleService from "../../../../../modules/after-sales/service";
import {
  eligibilityFor,
  requestDetails,
  requireGuestAccess,
  retrieveOrderForAfterSales,
} from "../../../../after-sales-helpers";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { order_id: orderId, access_token: token } = req.validatedBody as {
    order_id: string;
    access_token: string;
  };
  const access = await requireGuestAccess(req.scope, orderId, token);
  const order = await retrieveOrderForAfterSales(req.scope, orderId);
  const service =
    req.scope.resolve<AfterSalesModuleService>(AFTER_SALES_MODULE);
  const requests = await service.listAfterSalesRequests({
    order_id: orderId,
    customer_email: access.email,
  });
  res.json({
    order: {
      id: order.id,
      display_id: order.display_id,
      currency_code: order.currency_code,
      status: order.status,
      fulfillment_status: order.fulfillment_status,
      payment_status: order.payment_status,
      created_at: order.created_at,
      total: order.total,
      items: order.items,
      fulfillments: order.fulfillments,
    },
    eligibility: eligibilityFor(order),
    requests: await Promise.all(
      requests.map((request) => requestDetails(req.scope, request)),
    ),
  });
}
