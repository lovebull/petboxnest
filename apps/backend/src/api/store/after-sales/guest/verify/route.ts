import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { verifyGuestAccessCodeWorkflow } from "../../../../../workflows/after-sales/verify-guest-access-code";

type Body = { order_reference: string; email: string; code: string };

export async function POST(req: MedusaRequest<Body>, res: MedusaResponse) {
  const { result } = await verifyGuestAccessCodeWorkflow(req.scope).run({
    input: req.validatedBody,
  });
  res.json(result);
}
