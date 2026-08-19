import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createPromotionsWorkflow,
  updatePromotionsWorkflow,
} from "@medusajs/medusa/core-flows"

import {
  prepareReferralProgramStep,
  type ReferralProgramInput,
} from "./steps/prepare-referral-program"
import { saveReferralProgramStep } from "./steps/save-referral-program"

export const upsertReferralProgramWorkflow = createWorkflow(
  "upsert-referral-program",
  function (input: ReferralProgramInput) {
    const prepared = prepareReferralProgramStep(input)

    const createInput = transform({ prepared }, ({ prepared }) => ({
      promotionsData: [
        {
          code: prepared.settings.promotion_code,
          type: "standard" as const,
          status: prepared.settings.is_active ? ("active" as const) : ("draft" as const),
          application_method: {
            type: "percentage" as const,
            target_type: "order" as const,
            allocation: "across" as const,
            value: prepared.settings.referee_discount_percentage,
          },
        },
      ],
    }))
    const createdPromotions = when(
      { prepared },
      ({ prepared }) => !prepared.promotion_id
    ).then(() => createPromotionsWorkflow.runAsStep({ input: createInput }))

    const updateInput = transform({ prepared }, ({ prepared }) => ({
      promotionsData: [
        {
          id: prepared.promotion_id!,
          code: prepared.settings.promotion_code,
          status: prepared.settings.is_active ? ("active" as const) : ("draft" as const),
          application_method: {
            type: "percentage" as const,
            target_type: "order" as const,
            allocation: "across" as const,
            value: prepared.settings.referee_discount_percentage,
          },
        },
      ],
    }))
    const updatedPromotions = when(
      { prepared },
      ({ prepared }) => Boolean(prepared.promotion_id)
    ).then(() => updatePromotionsWorkflow.runAsStep({ input: updateInput }))

    const saveInput = transform(
      { prepared, createdPromotions, updatedPromotions },
      ({ prepared, createdPromotions, updatedPromotions }) => ({
        ...prepared,
        resolved_promotion_id:
          prepared.promotion_id ||
          createdPromotions?.[0]?.id ||
          updatedPromotions?.[0]?.id!,
      })
    )
    const program = saveReferralProgramStep(saveInput)

    return new WorkflowResponse(program)
  }
)
