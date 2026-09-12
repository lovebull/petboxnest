import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { createGuestAccessCodeWorkflow } from "../../../../../workflows/after-sales/create-guest-access-code";

type Body = { order_reference: string; email: string };

export async function POST(req: MedusaRequest<Body>, res: MedusaResponse) {
  let developmentCode: string | undefined;
  try {
    const { result } = await createGuestAccessCodeWorkflow(req.scope).run({
      input: req.validatedBody,
    });
    developmentCode =
      process.env.NODE_ENV === "development" && !process.env.RESEND_API_KEY
        ? (result as any).code
        : undefined;
  } catch {
    // Deliberately return the same response to prevent order/email enumeration.
  }
  res.status(202).json({
    message: "If the order details match, a verification code has been sent.",
    ...(developmentCode ? { development_code: developmentCode } : {}),
  });
}
