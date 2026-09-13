import { unsubscribeCommerceEmail } from "@lib/data/commerce-automation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata = { title: "Cart reminder preferences | PetBoxNest", robots: { index: false, follow: false } }

export default async function CartRecoveryUnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams
  let success = false
  if (token) { try { await unsubscribeCommerceEmail("cart-recovery", token); success = true } catch {} }
  return <main className="content-container py-16 small:py-24"><div className="mx-auto max-w-xl rounded-[28px] border border-[#E4E1F2] bg-white p-8 text-center shadow-[0_16px_50px_rgba(32,36,51,0.08)]">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">PetBoxNest preferences</p>
    <h1 className="mt-3 font-display text-3xl font-bold text-ink">{success ? "Cart reminders turned off" : "This unsubscribe link is invalid"}</h1>
    <p className="mt-4 text-muted">{success ? "We won’t send another reminder for this cart." : "The link may have expired. No other email preferences were changed."}</p>
    <LocalizedClientLink href="/store" className="mt-7 inline-flex min-h-12 items-center rounded-[14px] bg-ink px-6 font-bold text-white">Continue shopping</LocalizedClientLink>
  </div></main>
}
