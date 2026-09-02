"use client"

import { Badge, Heading, Input, Label, Text } from "@modules/common/components/ui"
import React from "react"

import { applyPromotions } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import Trash from "@modules/common/icons/trash"
import ErrorMessage from "../error-message"
import { SubmitButton } from "../submit-button"

type DiscountCodeProps = {
  cart: HttpTypes.StoreCart
  variant?: "default" | "cart"
}

const DiscountCode: React.FC<DiscountCodeProps> = ({
  cart,
  variant = "default",
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState("")

  const { promotions = [] } = cart
  const removePromotionCode = async (code: string) => {
    const validPromotions = promotions.filter(
      (promotion) => promotion.code !== code
    )

    await applyPromotions(
      validPromotions.filter((p) => p.code !== undefined).map((p) => p.code!)
    )
  }

  const addPromotionCode = async (formData: FormData) => {
    setErrorMessage("")

    const code = formData.get("code")
    if (!code) {
      return
    }
    const input = document.getElementById("promotion-input") as HTMLInputElement
    const codes = promotions
      .filter((p) => p.code !== undefined)
      .map((p) => p.code!)
    codes.push(code.toString())

    try {
      await applyPromotions(codes)
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : String(e))
    }

    if (input) {
      input.value = ""
    }
  }

  if (variant === "default") {
    return (
      <div className="w-full bg-white flex flex-col">
        <div className="txt-medium">
          <form action={(a) => addPromotionCode(a)} className="w-full mb-5">
            <Label className="flex gap-x-1 my-2 items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="txt-medium text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                data-testid="add-discount-button"
              >
                Add Promotion Code(s)
              </button>
            </Label>

            {isOpen && (
              <>
                <div className="flex w-full gap-x-2">
                  <Input
                    className="size-full"
                    id="promotion-input"
                    name="code"
                    type="text"
                    autoFocus={false}
                    data-testid="discount-input"
                  />
                  <SubmitButton
                    variant="secondary"
                    data-testid="discount-apply-button"
                  >
                    Apply
                  </SubmitButton>
                </div>

                <ErrorMessage
                  error={errorMessage}
                  data-testid="discount-error-message"
                />
              </>
            )}
          </form>

          {promotions.length > 0 && (
            <div className="w-full flex items-center">
              <div className="flex flex-col w-full">
                <Heading className="txt-medium mb-2">
                  Promotion(s) applied:
                </Heading>

                {promotions.map((promotion) => {
                  return (
                    <div
                      key={promotion.id}
                      className="flex items-center justify-between w-full max-w-full mb-2"
                      data-testid="discount-row"
                    >
                      <Text className="flex gap-x-1 items-baseline txt-small-plus w-4/5 pr-1">
                        <span className="truncate" data-testid="discount-code">
                          <Badge
                            color={promotion.is_automatic ? "green" : "grey"}
                          >
                            {promotion.code}
                          </Badge>{" "}
                          (
                          {promotion.application_method?.value !== undefined &&
                            promotion.application_method.currency_code !==
                              undefined && (
                              <>
                                {promotion.application_method.type ===
                                "percentage"
                                  ? `${promotion.application_method.value}%`
                                  : convertToLocale({
                                      amount:
                                        +promotion.application_method.value,
                                      currency_code:
                                        promotion.application_method
                                          .currency_code,
                                    })}
                              </>
                            )}
                          )
                        </span>
                      </Text>
                      {!promotion.is_automatic && (
                        <button
                          className="flex items-center"
                          onClick={() => {
                            if (!promotion.code) {
                              return
                            }

                            removePromotionCode(promotion.code)
                          }}
                          data-testid="remove-discount-button"
                        >
                          <Trash size={14} />
                          <span className="sr-only">
                            Remove discount code from order
                          </span>
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col rounded-[20px] border border-[#E6E8EC] bg-white p-4">
      <div className="text-sm">
        <form action={(a) => addPromotionCode(a)} className="w-full mb-5">
          <Label className="my-0 flex items-center justify-between gap-x-3">
            <span className="font-bold text-ink">Have a promotion code?</span>
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="pbn-focus inline-flex min-h-10 items-center rounded-[14px] bg-cream px-4 text-sm font-bold text-brand transition hover:bg-mist"
              data-testid="add-discount-button"
            >
              {isOpen ? "Hide" : "Add code"}
            </button>
          </Label>

          {isOpen && (
            <>
              <div className="mt-4 grid w-full gap-2 xsmall:grid-cols-[minmax(0,1fr)_auto]">
                <Input
                  className="min-h-11 rounded-[14px] border-[#E6E8EC] text-base"
                  id="promotion-input"
                  name="code"
                  type="text"
                  autoFocus={false}
                  data-testid="discount-input"
                />
                <SubmitButton
                  variant="secondary"
                  className="min-h-11 rounded-[14px] border-[#E6E8EC] px-5 font-bold hover:border-brand hover:bg-cream hover:text-brand"
                  data-testid="discount-apply-button"
                >
                  Apply
                </SubmitButton>
              </div>

              <ErrorMessage
                error={errorMessage}
                data-testid="discount-error-message"
              />
            </>
          )}
        </form>

        {promotions.length > 0 && (
          <div className="flex w-full items-center">
            <div className="flex w-full flex-col">
              <Heading className="mb-2 text-sm font-bold text-ink">
                Promotion(s) applied:
              </Heading>

              {promotions.map((promotion) => {
                return (
                  <div
                    key={promotion.id}
                    className="mb-2 flex min-h-10 w-full max-w-full items-center justify-between gap-3 rounded-[14px] bg-cream px-3"
                    data-testid="discount-row"
                  >
                    <Text className="flex w-4/5 items-baseline gap-x-1 pr-1 text-sm">
                      <span className="truncate" data-testid="discount-code">
                        <Badge
                          className="bg-mint text-ink"
                          color={promotion.is_automatic ? "green" : "grey"}
                        >
                          {promotion.code}
                        </Badge>{" "}
                        (
                        {promotion.application_method?.value !== undefined &&
                          promotion.application_method.currency_code !==
                            undefined && (
                            <>
                              {promotion.application_method.type ===
                              "percentage"
                                ? `${promotion.application_method.value}%`
                                : convertToLocale({
                                    amount: +promotion.application_method.value,
                                    currency_code:
                                      promotion.application_method
                                        .currency_code,
                                  })}
                            </>
                          )}
                        )
                        {/* {promotion.is_automatic && (
                          <Tooltip content="This promotion is automatically applied">
                            <InformationCircleSolid className="inline text-zinc-400" />
                          </Tooltip>
                        )} */}
                      </span>
                    </Text>
                    {!promotion.is_automatic && (
                      <button
                        className="pbn-focus flex min-h-10 min-w-10 items-center justify-center rounded-xl text-muted transition hover:text-brand"
                        onClick={() => {
                          if (!promotion.code) {
                            return
                          }

                          removePromotionCode(promotion.code)
                        }}
                        data-testid="remove-discount-button"
                      >
                        <Trash size={14} />
                        <span className="sr-only">
                          Remove discount code from order
                        </span>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DiscountCode
