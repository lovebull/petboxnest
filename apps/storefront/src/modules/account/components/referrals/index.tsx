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
    <div className="w-full space-y-8" data-testid="referrals-page">
      <div className="rounded-[22px] bg-cream p-5 xsmall:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
          Share the nest
        </p>
        <Heading
          level="h1"
          className="mt-2 font-display text-3xl font-bold leading-tight text-ink"
        >
          Refer a friend
        </Heading>
        <Text className="mt-3 max-w-2xl text-base leading-7 text-muted">
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
        <form
          action={activateReferralParticipant}
          className="rounded-[22px] border border-[#E6E8EC] bg-white p-5"
        >
          <Text className="mb-4 text-muted">
            Activate your personal referral link to start sharing.
          </Text>
          <Button type="submit" className="pbn-primary-button">
            Activate referral link
          </Button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4 small:grid-cols-2">
        <Balance label="Pending commission" amount={pending} currency={currency} />
        <Balance label="Paid as store credit" amount={paid} currency={currency} />
      </div>

      <div className="rounded-[22px] border border-[#E6E8EC] bg-white p-5">
        <Heading
          level="h2"
          className="mb-4 font-display text-2xl font-bold text-ink"
        >
          Commission activity
        </Heading>
        {dashboard.referral_conversions.length ? (
          <div className="divide-y divide-[#E6E8EC]">
            {dashboard.referral_conversions.map((conversion) => (
              <div
                key={conversion.id}
                className="grid grid-cols-[1fr_auto] gap-4 py-4"
              >
                <div>
                  <Text className="font-bold text-ink">
                    Order #{conversion.order_display_id}
                  </Text>
                  <Text className="text-sm text-muted">
                    {statusLabels[conversion.status]} ·{" "}
                    {new Date(conversion.created_at).toLocaleDateString("en-US")}
                  </Text>
                </div>
                <Text className="font-bold text-ink">
                  {convertToLocale({
                    amount: Number(conversion.commission_amount),
                    currency_code: conversion.currency_code,
                  })}
                </Text>
              </div>
            ))}
          </div>
        ) : (
          <Text className="rounded-[18px] border border-dashed border-brand/30 bg-cream p-6 text-center text-muted">
            No referral activity yet.
          </Text>
        )}
      </div>

      <Text className="rounded-[18px] bg-cream p-4 text-sm leading-6 text-muted">
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
    <div className="rounded-[20px] border border-[#E6E8EC] bg-white p-5 shadow-[0_8px_24px_rgba(32,36,51,0.04)]">
      <Text className="text-sm font-bold text-muted">{label}</Text>
      <Text className="mt-2 font-display text-3xl font-bold text-ink">
        {convertToLocale({ amount, currency_code: currency })}
      </Text>
    </div>
  )
}
