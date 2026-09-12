import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import {
  updateAfterSalesStatusWorkflow,
  type AfterSalesStatus,
} from "../../../../../workflows/after-sales/update-after-sales-status";
import { requestDetails } from "../../../../after-sales-helpers";

type Body = {
  status: AfterSalesStatus;
  admin_note?: string | null;
  customer_message?: string | null;
  resolution?: any;
  medusa_return_id?: string | null;
  medusa_exchange_id?: string | null;
  medusa_claim_id?: string | null;
};

export async function POST(
  req: AuthenticatedMedusaRequest<Body>,
  res: MedusaResponse,
) {
  const { result } = await updateAfterSalesStatusWorkflow(req.scope).run({
    input: {
      id: req.params.id,
      admin_id: req.auth_context.actor_id,
      ...req.validatedBody,
    },
  });
  res.json({
    request: await requestDetails(req.scope, (result as any).request, true),
  });
}
