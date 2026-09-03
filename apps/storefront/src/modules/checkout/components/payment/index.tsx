"use client"
import { RadioGroup } from "@headlessui/react"
import { isStripeLike, paymentInfoMap } from "@lib/constants"
import { initiatePaymentSession } from "@lib/data/cart"
import { CheckCircleSolid, CreditCard } from "@medusajs/icons"
import ErrorMessage from "@modules/checkout/components/error-message"
import PaymentContainer, {
  StripePaymentContainer,
} from "@modules/checkout/components/payment-container"
import {
  Button,
  Container,
  Heading,
  Text,
  clx,
} from "@modules/common/components/ui"
import { HttpTypes } from "@medusajs/types"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: HttpTypes.StoreCart
  availablePaymentMethods: { id: string }[]
}) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession) => paymentSession.status === "pending",
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? "",
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "payment"

  const setPaymentMethod = async (method: string) => {
    setError(null)
    setSelectedPaymentMethod(method)
    if (isStripeLike(method)) {
      await initiatePaymentSession(cart, {
        provider_id: method,
      })
    }
  }

  const paidByGiftcard = !!(
    (cart as unknown as Record<string, unknown>)?.gift_cards &&
    ((cart as unknown as Record<string, unknown>)?.gift_cards as unknown[])
      ?.length > 0 &&
    cart?.total === 0
  )
  const paidByStoreCredit =
    Number(cart.credit_line_total || 0) > 0 && cart.total === 0
  const paidWithoutProvider = paidByGiftcard || paidByStoreCredit

  const paymentReady =
    (activeSession && (cart?.shipping_methods?.length ?? 0) !== 0) ||
    paidWithoutProvider

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams],
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      if (paidWithoutProvider) {
        return router.push(
          pathname + "?" + createQueryString("step", "review"),
          { scroll: false },
        )
      }

      const shouldInputPaymentDetails =
        isStripeLike(selectedPaymentMethod) && !activeSession

      const checkActiveSession =
        activeSession?.provider_id === selectedPaymentMethod

      if (!checkActiveSession) {
        await initiatePaymentSession(cart, {
          provider_id: selectedPaymentMethod,
        })
      }

      if (!shouldInputPaymentDetails) {
        return router.push(
          pathname + "?" + createQueryString("step", "review"),
          {
            scroll: false,
          },
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <section
      className={`rounded-[24px] border bg-white p-5 shadow-[0_8px_24px_rgba(32,36,51,0.05)] xsmall:p-6 small:rounded-[28px] small:p-8 ${
        isOpen ? "border-brand/30" : "border-[#E6E8EC]"
      }`}
      aria-labelledby="checkout-payment-heading"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <Heading
          level="h2"
          id="checkout-payment-heading"
          className={clx(
            "flex items-center gap-3 font-display text-[26px] font-bold leading-tight text-ink xsmall:text-[30px]",
            {
              "opacity-45 pointer-events-none select-none":
                !isOpen && !paymentReady,
            },
          )}
        >
          <span
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-[14px] text-sm ${
              isOpen
                ? "bg-brand text-white"
                : paymentReady
                  ? "bg-mint text-ink"
                  : "bg-mist text-muted"
            }`}
            aria-hidden="true"
          >
            {!isOpen && paymentReady ? <CheckCircleSolid /> : "3"}
          </span>
          <span>
            Payment
            <span className="mt-1 block font-sans text-sm font-normal text-muted">
              Choose an available secure payment method.
            </span>
          </span>
        </Heading>
        {!isOpen && paymentReady && (
          <Text>
            <button
              onClick={handleEdit}
              className="pbn-focus inline-flex min-h-11 items-center rounded-[14px] bg-cream px-4 text-sm font-bold text-brand transition-colors hover:bg-mist hover:text-brand-dark"
              data-testid="edit-payment-button"
            >
              Edit
            </button>
          </Text>
        )}
      </div>
      <div>
        <div className={isOpen ? "block" : "hidden"}>
          {!paidWithoutProvider && availablePaymentMethods?.length && (
            <>
              <RadioGroup
                value={selectedPaymentMethod}
                onChange={(value: string) => setPaymentMethod(value)}
              >
                {availablePaymentMethods.map((paymentMethod) => (
                  <div key={paymentMethod.id}>
                    {isStripeLike(paymentMethod.id) ? (
                      <StripePaymentContainer
                        paymentProviderId={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                        paymentInfoMap={paymentInfoMap}
                        setError={setError}
                        setPaymentComplete={setPaymentComplete}
                      />
                    ) : (
                      <PaymentContainer
                        paymentInfoMap={paymentInfoMap}
                        paymentProviderId={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                      />
                    )}
                  </div>
                ))}
              </RadioGroup>
            </>
          )}

          {paidWithoutProvider && (
            <div className="flex flex-col rounded-[16px] bg-cream p-4 xsmall:max-w-sm">
              <Text className="mb-1 text-sm font-bold text-ink">
                Payment method
              </Text>
              <Text
                className="text-sm text-muted"
                data-testid="payment-method-summary"
              >
                {paidByStoreCredit ? "Store credit" : "Gift card"}
              </Text>
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />

          <Button
            size="large"
            className="mt-6 min-h-12 w-full rounded-[14px] !bg-brand px-6 text-base font-bold !text-white hover:!bg-brand-dark xsmall:w-auto"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={
              (isStripeLike(selectedPaymentMethod) && !paymentComplete) ||
              (!selectedPaymentMethod && !paidWithoutProvider)
            }
            data-testid="submit-payment-button"
          >
            {!activeSession && isStripeLike(selectedPaymentMethod)
              ? "Enter payment details"
              : "Continue to review"}
          </Button>
        </div>

        <div className={isOpen ? "hidden" : "block"}>
          {cart && paymentReady && activeSession ? (
            <div className="grid w-full gap-4 xsmall:grid-cols-2">
              <div className="flex min-w-0 flex-col rounded-[16px] bg-cream p-4">
                <Text className="mb-1 text-sm font-bold text-ink">
                  Payment method
                </Text>
                <Text
                  className="break-words text-sm text-muted"
                  data-testid="payment-method-summary"
                >
                  {paymentInfoMap[activeSession?.provider_id]?.title ||
                    activeSession?.provider_id}
                </Text>
              </div>
              <div className="flex min-w-0 flex-col rounded-[16px] bg-mist p-4">
                <Text className="mb-1 text-sm font-bold text-ink">
                  Payment details
                </Text>
                <div
                  className="flex items-center gap-2 text-sm text-muted"
                  data-testid="payment-details-summary"
                >
                  <Container className="flex h-9 w-fit items-center rounded-xl bg-white p-2">
                    {paymentInfoMap[selectedPaymentMethod]?.icon || (
                      <CreditCard />
                    )}
                  </Container>
                  <Text>Another step will appear</Text>
                </div>
              </div>
            </div>
          ) : paidWithoutProvider ? (
            <div className="flex flex-col rounded-[16px] bg-cream p-4 xsmall:max-w-sm">
              <Text className="mb-1 text-sm font-bold text-ink">
                Payment method
              </Text>
              <Text
                className="text-sm text-muted"
                data-testid="payment-method-summary"
              >
                {paidByStoreCredit ? "Store credit" : "Gift card"}
              </Text>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default Payment
