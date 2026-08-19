import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { PromotionActions } from "@medusajs/framework/utils"
import {
  updateCartPromotionsWorkflow,
  updateCartWorkflow,
} from "@medusajs/medusa/core-flows"

import { prepareReferralAttributionStep } from "./steps/prepare-referral-attribution"

export const bindReferralToCartWorkflow = createWorkflow(
  "bind-referral-to-cart",
  function (input: {
    cart_id: string
    code: string
    customer_id?: string | null
  }) {
    const prepared = prepareReferralAttributionStep(input)
    const updateInput = transform(
      { input, prepared },
      ({ input, prepared }) => ({
        id: input.cart_id,
        metadata: prepared.cart_metadata,
      })
    )
    updateCartWorkflow.runAsStep({ input: updateInput })

    const promotionsInput = transform(
      { input, prepared },
      ({ input, prepared }) => ({
        cart_id: input.cart_id,
        promo_codes: [prepared.promotion_code],
        action: PromotionActions.ADD,
      })
    )
    when(
      { prepared },
      ({ prepared }) => prepared.should_apply_discount
    ).then(() =>
      updateCartPromotionsWorkflow.runAsStep({ input: promotionsInput })
    )

    return new WorkflowResponse(prepared)
  }
)
