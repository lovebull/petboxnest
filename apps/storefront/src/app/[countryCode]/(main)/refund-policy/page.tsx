import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { createMarketingMetadata } from "@lib/util/seo-metadata"
import {
  ArrowPath,
  ArrowRight,
  ChatBubbleLeftRight,
  Clock,
  ExclamationCircleSolid,
  ShoppingBag,
} from "@medusajs/icons"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  return createMarketingMetadata({
    countryCode: (await params).countryCode,
    path: "refund-policy",
    title: "Refund Policy | PetBoxNest",
    description:
      "Review PetBoxNest's final-sale policy and guidance for defective items, incorrect items, and order discrepancies.",
  })
}

const policyItems = [
  {
    title: "All Sales Are Final",
    description:
      "Once an order is placed, it cannot be cancelled, returned, or exchanged. We encourage our customers to review their selections carefully before finalizing their purchase.",
    accent: "bg-yellow",
  },
  {
    title: "No Refunds or Exchanges",
    description:
      "We do not offer refunds or exchanges on any products purchased from our store. Please ensure you have selected the correct items and quantities before completing your order.",
    accent: "bg-sky",
  },
  {
    title: "Product Concerns",
    description:
      "If you believe you have received a defective or incorrect item, please contact our customer service team immediately at support@Petboxnest.com. We will do our best to address and resolve any issues.",
    accent: "bg-mint",
  },
  {
    title: "Order Discrepancies",
    description:
      "If there are any discrepancies with your order, such as missing or incorrect items, please notify us within 48 hours of receiving your package. We will investigate the matter and provide appropriate solutions.",
    accent: "bg-yellow",
  },
  {
    title: "Understanding Our Policy",
    description:
      "We understand that every situation is unique. Our policy is in place to ensure the integrity and quality of our products. We encourage all customers to reach out with any questions or concerns before placing an order.",
    accent: "bg-sky",
  },
]

const policyLinks = [
  { id: "return-eligibility", label: "Return eligibility" },
  { id: "amazon-purchases", label: "Amazon purchases" },
  { id: "policy-acknowledgment", label: "Policy acknowledgment" },
]

export default function RefundPolicyPage() {
  return (
    <main className="overflow-x-clip bg-cream text-ink">
      <header className="border-b border-[#E6E8EC] bg-cream">
        <div className="pbn-container grid gap-10 py-14 small:grid-cols-[minmax(0,1fr)_380px] small:items-end small:py-24 medium:grid-cols-[minmax(0,1fr)_420px] medium:py-28">
          <div>
            <p className="inline-flex min-h-10 items-center gap-2 rounded-full bg-mint px-4 text-xs font-bold uppercase tracking-[0.16em] text-ink">
              <ArrowPath aria-hidden="true" />
              Help
            </p>
            <h1 className="mt-6 max-w-[820px] text-balance font-display text-[44px] font-bold leading-[1.02] tracking-[-0.05em] xsmall:text-[56px] small:text-[72px] medium:text-[80px]">
              Returns and refunds
            </h1>
            <p className="mt-6 max-w-[680px] text-lg leading-8 text-muted small:text-xl small:leading-9">
              We want every Petboxnest product to feel right.
            </p>
          </div>

          <aside className="rounded-[24px] bg-ink p-6 text-white shadow-[0_16px_40px_rgba(32,36,51,0.14)] xsmall:p-8">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-yellow text-ink">
              <Clock aria-hidden="true" />
            </span>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-yellow">
              Last updated
            </p>
            <p className="mt-2 font-display text-[30px] font-bold leading-tight">
              August 9, 2026
            </p>
            <div className="mt-5 border-t border-white/15 pt-5">
              <p className="font-display text-lg font-bold">
                All Sales Are Final
              </p>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Once an order is placed, it cannot be cancelled, returned, or
                exchanged.
              </p>
            </div>
          </aside>
        </div>
      </header>

      <div className="bg-mist py-14 small:py-20 medium:py-24">
        <div className="pbn-container grid min-w-0 gap-8 small:grid-cols-[280px_minmax(0,1fr)] small:items-start small:gap-10 medium:gap-14">
          <aside className="min-w-0 space-y-5 small:sticky small:top-28">
            <nav
              aria-label="Refund policy sections"
              className="rounded-[24px] border border-[#E6E8EC] bg-white p-5 shadow-[0_8px_24px_rgba(32,36,51,0.06)]"
            >
              <h2 className="font-display text-xl font-bold tracking-[-0.02em]">
                On this page
              </h2>
              <ol className="mt-4 space-y-1">
                {policyLinks.map((link, index) => (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      className="pbn-focus flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold leading-5 text-muted transition-colors hover:bg-cream hover:text-brand"
                    >
                      <span className="text-xs text-brand">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{link.label}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="rounded-[24px] bg-ink p-6 text-white shadow-[0_16px_40px_rgba(32,36,51,0.12)]">
              <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-sky text-ink">
                <ChatBubbleLeftRight aria-hidden="true" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-bold">
                Need help?
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/75">
                Our customer care team can help with orders, products, and
                policy questions.
              </p>
              <LocalizedClientLink
                href="/contact"
                className="pbn-focus mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-white px-5 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:bg-cream motion-reduce:transition-none"
              >
                Contact us <ArrowRight aria-hidden="true" />
              </LocalizedClientLink>
            </div>
          </aside>

          <article className="min-w-0 space-y-5 small:space-y-6">
            <section
              id="return-eligibility"
              className="scroll-mt-28 rounded-[24px] border border-[#E6E8EC] bg-white p-5 shadow-[0_8px_24px_rgba(32,36,51,0.06)] xsmall:p-7 small:rounded-[32px] small:p-10"
            >
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-yellow text-ink">
                  <ExclamationCircleSolid aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
                    Before you order
                  </p>
                  <h2 className="mt-2 font-display text-[30px] font-bold leading-[1.1] tracking-[-0.035em] xsmall:text-[34px] small:text-[40px]">
                    Return eligibility
                  </h2>
                </div>
              </div>

              <ul className="mt-7 space-y-3 small:ml-[60px]">
                {policyItems.map((item, index) => (
                  <li
                    key={item.title}
                    className="rounded-[16px] border border-[#E6E8EC] bg-cream p-4 xsmall:p-5"
                  >
                    <div className="flex items-start gap-4">
                      <span
                        aria-hidden="true"
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-bold text-ink ${item.accent}`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="text-base leading-7 text-muted">
                        <strong className="font-bold text-ink">
                          {item.title}:
                        </strong>{" "}
                        {item.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section
              id="amazon-purchases"
              className="scroll-mt-28 rounded-[24px] border border-[#E6E8EC] bg-white p-5 shadow-[0_8px_24px_rgba(32,36,51,0.06)] xsmall:p-7 small:rounded-[32px] small:p-10"
            >
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-sky text-ink">
                  <ShoppingBag aria-hidden="true" />
                </span>
                <h2 className="pt-1 font-display text-[30px] font-bold leading-[1.1] tracking-[-0.035em] xsmall:text-[34px] small:text-[40px]">
                  Amazon purchases
                </h2>
              </div>
              <p className="mt-6 text-base leading-7 text-muted small:ml-[60px] small:text-[17px] small:leading-8">
                Products purchased through Amazon must be returned through
                Amazon and follow the return policy shown on that order.
              </p>
            </section>

            <section
              id="policy-acknowledgment"
              aria-label="Policy acknowledgment"
              className="scroll-mt-28 rounded-[24px] border-2 border-ink bg-yellow p-5 shadow-[0_8px_24px_rgba(32,36,51,0.08)] xsmall:p-7 small:rounded-[32px] small:p-10"
            >
              <p className="max-w-[760px] font-display text-xl font-bold leading-8 text-ink small:text-2xl small:leading-9">
                By making a purchase on Petboxnest, you acknowledge and agree to
                our return policy. We thank you for your understanding and look
                forward to serving your pet care needs.
              </p>
            </section>
          </article>
        </div>
      </div>
    </main>
  )
}
