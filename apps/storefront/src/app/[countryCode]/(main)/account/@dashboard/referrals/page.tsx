import { getReferralDashboard } from "@lib/data/referrals"
import { retrieveCustomer } from "@lib/data/customer"
import Referrals from "@modules/account/components/referrals"
import { Heading, Text } from "@modules/common/components/ui"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Refer a friend",
  description: "Share your referral link and view commission activity.",
}

export default async function ReferralsPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const [{ countryCode }, customer, dashboard] = await Promise.all([
    params,
    retrieveCustomer().catch(() => null),
    getReferralDashboard(),
  ])
  if (!customer) {
    redirect(`/${countryCode}/account`)
  }

  if (!dashboard) {
    return (
      <div className="w-full rounded-[22px] bg-cream p-5 xsmall:p-6">
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
          Referral information is temporarily unavailable. Please refresh after
          the Medusa backend has restarted.
        </Text>
      </div>
    )
  }

  return <Referrals dashboard={dashboard} countryCode={countryCode} />
}
