import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  createAfterSalesRequestWorkflow,
  type CreateAfterSalesInput,
} from "../../../../../workflows/after-sales/create-after-sales-request";
import { requestDetails } from "../../../../after-sales-helpers";

export async function POST(
  req: MedusaRequest<CreateAfterSalesInput>,
  res: MedusaResponse,
) {
  const { result } = await createAfterSalesRequestWorkflow(req.scope).run({
    input: { ...req.validatedBody, customer_id: null },
  });
  res
    .status(201)
    .json({
      request: await requestDetails(req.scope, (result as any).request),
    });
}
