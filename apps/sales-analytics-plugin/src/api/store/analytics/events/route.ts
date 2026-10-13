import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import type { StorefrontAnalyticsEventBody } from "../../../validators";
import { recordStorefrontAnalyticsEventWorkflow } from "../../../../workflows";

export async function POST(
  req: MedusaRequest<StorefrontAnalyticsEventBody>,
  res: MedusaResponse,
) {
  const forwardedFor = req.headers["x-forwarded-for"];
  const requestIp = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(",")[0]?.trim() || req.ip || null;
  const { result } = await recordStorefrontAnalyticsEventWorkflow(
    req.scope,
  ).run({
    input: { ...req.validatedBody, request_ip: requestIp },
  });

  res.status(202).json(result);
}
