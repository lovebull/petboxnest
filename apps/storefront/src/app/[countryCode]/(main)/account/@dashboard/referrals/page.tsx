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
      <div className="w-full">
        <Heading level="h1" className="text-2xl-semi">
          Refer a friend
        </Heading>
        <Text className="mt-2 text-ui-fg-subtle">
          Referral information is temporarily unavailable. Please refresh after
          the Medusa backend has restarted.
        </Text>
      </div>
    )
  }

  return <Referrals dashboard={dashboard} countryCode={countryCode} />
}
