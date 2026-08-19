import {
  activateReferralParticipant,
  type ReferralDashboard,
} from "@lib/data/referrals"
import { convertToLocale } from "@lib/util/money"
import { Button, Heading, Text } from "@modules/common/components/ui"

import ReferralShare from "./referral-share"

const statusLabels = {
  pending: "Pending",
  paid: "Paid",
  partially_reversed: "Partially reversed",
  reversed: "Reversed",
  cancelled: "Cancelled",
}

export default function Referrals({
  dashboard,
  countryCode,
}: {
  dashboard: ReferralDashboard
  countryCode: string
}) {
  const program = dashboard.referral_program
  const currency =
    dashboard.referral_conversions[0]?.currency_code ||
    program?.currency_code ||
    "usd"
  const pending = dashboard.referral_conversions
    .filter((conversion) => conversion.status === "pending")
    .reduce((sum, conversion) => sum + Number(conversion.commission_amount), 0)
  const paid = dashboard.referral_conversions.reduce(
    (sum, conversion) =>
      sum + Number(conversion.credited_amount) - Number(conversion.reversed_amount),
    0
  )

  return (
    <div className="w-full" data-testid="referrals-page">
      <div className="mb-8 flex flex-col gap-y-1">
        <Heading level="h1" className="text-2xl-semi">
          Refer a friend
        </Heading>
        <Text className="text-base-regular text-ui-fg-subtle">
          Friends get {Number(program?.referee_discount_percentage || 10)}% off
          their first eligible order. You earn {Number(program?.commission_percentage || 8)}%
          in store credit after the order is completed and the {program?.waiting_days || 30}-day
          waiting period ends.
        </Text>
      </div>

      {dashboard.referral_participant ? (
        <ReferralShare
          code={dashboard.referral_participant.code}
          countryCode={countryCode}
          configuredOrigin={process.env.NEXT_PUBLIC_BASE_URL || ""}
        />
      ) : (
        <form action={activateReferralParticipant}>
          <Text className="mb-3 text-ui-fg-subtle">
            Activate your personal referral link to start sharing.
          </Text>
          <Button type="submit">Activate referral link</Button>
        </form>
      )}

      <div className="my-8 grid grid-cols-1 gap-6 border-y border-gray-200 py-6 small:grid-cols-2">
        <Balance label="Pending commission" amount={pending} currency={currency} />
        <Balance label="Paid as store credit" amount={paid} currency={currency} />
      </div>

      <div>
        <Heading level="h2" className="mb-4 text-xl-semi">
          Commission activity
        </Heading>
        {dashboard.referral_conversions.length ? (
          <div className="divide-y divide-gray-200 border-y border-gray-200">
            {dashboard.referral_conversions.map((conversion) => (
              <div
                key={conversion.id}
                className="grid grid-cols-[1fr_auto] gap-4 py-4"
              >
                <div>
                  <Text className="text-base-semi">
                    Order #{conversion.order_display_id}
                  </Text>
                  <Text className="text-small-regular text-ui-fg-subtle">
                    {statusLabels[conversion.status]} ·{" "}
                    {new Date(conversion.created_at).toLocaleDateString("en-US")}
                  </Text>
                </div>
                <Text className="text-base-semi">
                  {convertToLocale({
                    amount: Number(conversion.commission_amount),
                    currency_code: conversion.currency_code,
                  })}
                </Text>
              </div>
            ))}
          </div>
        ) : (
          <Text className="border-y border-gray-200 py-6 text-ui-fg-subtle">
            No referral activity yet.
          </Text>
        )}
      </div>

      <Text className="mt-8 text-small-regular text-ui-fg-subtle">
        Share honestly and disclose that you may receive store credit. Self-referrals,
        existing-customer orders, cancelled orders, and refunded amounts are not eligible.
      </Text>
    </div>
  )
}

function Balance({
  label,
  amount,
  currency,
}: {
  label: string
  amount: number
  currency: string
}) {
  return (
    <div>
      <Text className="text-small-regular text-ui-fg-subtle">{label}</Text>
      <Text className="mt-1 text-2xl-semi">
        {convertToLocale({ amount, currency_code: currency })}
      </Text>
    </div>
  )
}
