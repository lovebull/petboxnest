import { Container, Heading, Text } from "@modules/common/components/ui"

import { isStripeLike, paymentInfoMap } from "@lib/constants"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type PaymentDetailsProps = {
  order: HttpTypes.StoreOrder
}

const PaymentDetails = ({ order }: PaymentDetailsProps) => {
  const payment = order.payment_collections?.[0].payments?.[0]

  return (
    <section className="rounded-[24px] border border-[#E6E8EC] bg-white p-5 shadow-[0_8px_24px_rgba(32,36,51,0.05)] small:rounded-[28px] small:p-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Safe and sound</p>
          <Heading level="h2" className="mt-2 font-display text-2xl font-bold text-ink">Payment</Heading>
        </div>
        <span className="rounded-full bg-mist px-3 py-1 text-xs font-bold text-muted">Secure checkout</span>
      </div>
      <div>
        {payment && (
          <div className="grid gap-5 small:grid-cols-2 small:gap-6">
            <div className="flex flex-col">
              <Text className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                Payment method
              </Text>
              <Text
                className="text-sm font-semibold text-ink"
                data-testid="payment-method"
              >
                {paymentInfoMap[payment.provider_id]?.title || payment.provider_id}
              </Text>
            </div>
            <div className="flex flex-col">
              <Text className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                Payment details
              </Text>
              <div className="flex items-center gap-3 text-sm text-muted">
                <Container className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-mist p-2">
                  {paymentInfoMap[payment.provider_id]?.icon}
                </Container>
                <Text className="leading-6" data-testid="payment-amount">
                  {isStripeLike(payment.provider_id) && payment.data?.card_last4
                    ? `**** **** **** ${payment.data.card_last4}`
                    : `${convertToLocale({
                        amount: payment.amount,
                        currency_code: order.currency_code,
                      })} paid at ${new Date(
                        payment.created_at ?? ""
                      ).toLocaleString()}`}
                </Text>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default PaymentDetails
