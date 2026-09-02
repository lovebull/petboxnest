"use client"

import { Heading, Text, clx } from "@modules/common/components/ui"

import PaymentButton from "../payment-button"
import { useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

const Review = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const searchParams = useSearchParams()

  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard = !!(
    (cart as unknown as Record<string, unknown>)?.gift_cards &&
    ((cart as unknown as Record<string, unknown>)?.gift_cards as unknown[])
      ?.length > 0 &&
    cart?.total === 0
  )
  const paidByStoreCredit =
    Number(cart.credit_line_total || 0) > 0 && cart.total === 0

  const previousStepsCompleted =
    cart.shipping_address &&
    (cart.shipping_methods?.length ?? 0) > 0 &&
    (cart.payment_collection || paidByGiftcard || paidByStoreCredit)

  return (
    <section
      className={`rounded-[24px] border bg-white p-5 shadow-[0_8px_24px_rgba(32,36,51,0.05)] xsmall:p-6 small:rounded-[28px] small:p-8 ${
        isOpen ? "border-brand/30" : "border-[#E6E8EC]"
      }`}
      aria-labelledby="checkout-review-heading"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <Heading
          level="h2"
          id="checkout-review-heading"
          className={clx(
            "flex items-center gap-3 font-display text-[26px] font-bold leading-tight text-ink xsmall:text-[30px]",
            {
              "pointer-events-none select-none opacity-45": !isOpen,
            }
          )}
        >
          <span
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-[14px] text-sm ${
              isOpen ? "bg-brand text-white" : "bg-mist text-muted"
            }`}
            aria-hidden="true"
          >
            4
          </span>
          <span>
            Review
            <span className="mt-1 block font-sans text-sm font-normal text-muted">
              Check every detail before placing your order.
            </span>
          </span>
        </Heading>
      </div>
      {isOpen && previousStepsCompleted && (
        <>
          <div className="mb-6 flex w-full items-start rounded-[16px] bg-cream p-4 xsmall:p-5">
            <div className="w-full">
              <Text className="text-sm font-medium leading-6 text-muted">
                By clicking the Place Order button, you confirm that you have
                read, understand and accept our Terms of Use, Terms of Sale and
                Returns Policy and acknowledge that you have read Medusa
                Store&apos;s Privacy Policy.
              </Text>
            </div>
          </div>
          <PaymentButton cart={cart} data-testid="submit-order-button" />
        </>
      )}
    </section>
  )
}

export default Review
