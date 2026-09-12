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
import { generateAccessToken, hashSecret, normalizeEmail } from "./helpers";

type Input = { order_reference: string; email: string; code: string };

const verifyGuestCodeStep = createStep(
  "verify-guest-code",
  async (input: Input, { container }) => {
    const service =
      container.resolve<AfterSalesModuleService>(AFTER_SALES_MODULE);
    const email = normalizeEmail(input.email);
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const numericReference = /^\d+$/.test(input.order_reference);
    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["id", "email"],
      filters: numericReference
        ? { display_id: input.order_reference }
        : { id: input.order_reference },
    });
    const order = orders.find(
      (candidate: any) => normalizeEmail(candidate.email || "") === email,
    );
    if (!order)
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "The verification code is invalid or expired",
      );
    const records = await service.listGuestAccessCodes(
      { order_id: order.id, email },
      { order: { created_at: "DESC" }, take: 1 },
    );
    const record = records[0];
    if (
      !record ||
      record.consumed_at ||
      new Date(record.expires_at).getTime() < Date.now()
    ) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "The verification code is invalid or expired",
      );
    }
    if (record.attempts >= 5) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Too many verification attempts",
      );
    }
    if (record.code_hash !== hashSecret(input.code)) {
      await service.updateGuestAccessCodes({
        id: record.id,
        attempts: record.attempts + 1,
      });
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "The verification code is invalid or expired",
      );
    }
    const accessToken = generateAccessToken();
    await service.updateGuestAccessCodes({
      id: record.id,
      access_token_hash: hashSecret(accessToken),
      verified_at: new Date(),
      expires_at: new Date(Date.now() + 30 * 60_000),
    });
    return new StepResponse({
      access_token: accessToken,
      order_id: record.order_id,
    });
  },
);

export const verifyGuestAccessCodeWorkflow = createWorkflow(
  "verify-guest-access-code",
  function (input: Input) {
    return new WorkflowResponse(verifyGuestCodeStep(input));
  },
);
