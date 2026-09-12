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
import { emitEventStep } from "@medusajs/medusa/core-flows";
import { AFTER_SALES_MODULE } from "../../modules/after-sales";
import type AfterSalesModuleService from "../../modules/after-sales/service";
import { generateCode, hashSecret, normalizeEmail } from "./helpers";

type Input = { order_reference: string; email: string };

const createGuestAccessCodeStep = createStep(
  "create-guest-access-code",
  async (input: Input, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const email = normalizeEmail(input.email);
    const numericReference = /^\d+$/.test(input.order_reference);
    const filters = numericReference
      ? { display_id: input.order_reference }
      : { id: input.order_reference };
    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["id", "display_id", "email"],
      filters,
    });
    const order = orders.find(
      (candidate: any) => normalizeEmail(candidate.email || "") === email,
    );
    if (!order) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, "Order not found");
    }

    const service =
      container.resolve<AfterSalesModuleService>(AFTER_SALES_MODULE);
    const recent = await service.listGuestAccessCodes(
      { order_id: order.id, email },
      { order: { created_at: "DESC" }, take: 1 },
    );
    if (
      recent[0] &&
      Date.now() - new Date(recent[0].created_at).getTime() < 60_000
    ) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Please wait before requesting another code",
      );
    }

    const code = generateCode();
    const record = await service.createGuestAccessCodes({
      order_id: order.id,
      email,
      code_hash: hashSecret(code),
      access_token_hash: null,
      expires_at: new Date(Date.now() + 10 * 60_000),
      verified_at: null,
      attempts: 0,
      consumed_at: null,
    });
    return new StepResponse({ record, code, order }, record.id);
  },
  async (id: string | undefined, { container }) => {
    if (id)
      await container
        .resolve<AfterSalesModuleService>(AFTER_SALES_MODULE)
        .deleteGuestAccessCodes(id);
  },
);

export const createGuestAccessCodeWorkflow = createWorkflow(
  "create-guest-access-code",
  function (input: Input) {
    const result = createGuestAccessCodeStep(input);
    emitEventStep({
      eventName: "after_sales.guest_code_requested",
      data: result,
    });
    return new WorkflowResponse(result);
  },
);
