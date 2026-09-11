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
    title: "Returns & Refunds Policy | PetBoxNest",
    description:
      "Learn about PetBoxNest's 15-day return window, item eligibility, refund timing, return shipping, and help for incorrect or damaged orders.",
  })
}

const policyLinks = [
  { id: "money-back-guarantee", label: "Money-back guarantee" },
  { id: "return-eligibility", label: "Return eligibility" },
  { id: "refund-details", label: "Refund details" },
  { id: "order-changes", label: "Order changes" },
  { id: "order-issues", label: "Order issues" },
  { id: "how-to-return", label: "How to make a return" },
]

const eligibilityItems = [
  {
    title: "15-day return window",
    description:
      "Eligible items may be returned within 15 calendar days of confirmed delivery.",
    accent: "bg-yellow",
  },
  {
    title: "Item condition",
    description:
      "Items must be unused, clean, and undamaged, with their original packaging, accessories, and proof of purchase.",
    accent: "bg-sky",
  },
  {
    title: "Original payment method",
    description:
      "Approved refunds are returned to the original payment method used for the order.",
    accent: "bg-mint",
  },
]

const refundItems = [
  {
    title: "Refund processing",
    description:
      "After the returned item passes warehouse inspection, we will initiate the refund within 5 business days.",
    accent: "bg-mint",
  },
  {
    title: "Bank processing time",
    description:
      "Depending on your bank or payment provider, the refund may take an additional 5–10 business days to appear in your account.",
    accent: "bg-sky",
  },
  {
    title: "Return shipping",
    description:
      "For change-of-mind returns, the customer is responsible for return shipping costs.",
    accent: "bg-yellow",
  },
  {
    title: "Exchanges",
    description:
      "We do not currently offer direct exchanges. Please return the eligible item and place a new order for the product you want.",
    accent: "bg-sky",
  },
]

const returnSteps = [
  {
    title: "Contact our team",
    description:
      "Send us your order number, the item you want to return, and the reason for your request within the 15-day window.",
  },
  {
    title: "Wait for return instructions",
    description:
      "Our customer care team will review your request and provide the return address and packing instructions.",
  },
  {
    title: "Pack and send the item",
    description:
      "Pack the item securely with its original packaging, accessories, and proof of purchase, then keep your return tracking information.",
  },
  {
    title: "Inspection and refund",
    description:
      "Once received, the warehouse will inspect the item. Approved refunds are initiated within 5 business days.",
  },
]

export default function RefundPolicyPage() {
  return (
    <main className="overflow-x-clip bg-cream text-ink">
      <header className="border-b border-[#E6E8EC] bg-cream">
        <div className="pbn-container grid gap-10 py-14 small:grid-cols-[minmax(0,1fr)_380px] small:items-end small:py-24 medium:grid-cols-[minmax(0,1fr)_420px] medium:py-28">
          <div>
            <p className="inline-flex min-h-10 items-center gap-2 rounded-full bg-mint px-4 text-xs font-bold uppercase tracking-[0.16em] text-ink">
              <ArrowPath aria-hidden="true" />
              Returns made clear
            </p>
            <h1 className="mt-6 max-w-[820px] text-balance font-display text-[44px] font-bold leading-[1.02] tracking-[-0.05em] xsmall:text-[56px] small:text-[72px] medium:text-[80px]">
              Returns and refunds
            </h1>
            <p className="mt-6 max-w-[680px] text-lg leading-8 text-muted small:text-xl small:leading-9">
              A straightforward 15-day return window, with helpful support when
              an order arrives damaged, incomplete, or incorrect.
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
              September 11, 2026
            </p>
            <div className="mt-5 border-t border-white/15 pt-5">
              <p className="font-display text-lg font-bold">
                15-day return window
              </p>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Request a return within 15 calendar days of confirmed delivery.
              </p>
            </div>
          </aside>
        </div>
      </header>

      <div className="bg-mist py-14 small:py-20 medium:py-24">
        <div className="pbn-container grid min-w-0 gap-8 small:grid-cols-[280px_minmax(0,1fr)] small:items-start small:gap-10 medium:gap-14">
          <aside className="min-w-0 space-y-5 small:sticky small:top-28">
            <nav
              aria-label="Returns and refunds policy sections"
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
                Need help with a return?
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/75">
                Contact us before sending anything back. We will review your
                request and share the next steps.
              </p>
              <LocalizedClientLink
                href="/contact"
                className="pbn-focus mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-white px-5 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:bg-cream motion-reduce:transition-none"
              >
                Start a return <ArrowRight aria-hidden="true" />
              </LocalizedClientLink>
            </div>
          </aside>

          <article className="min-w-0 space-y-5 small:space-y-6">
            <section
              id="money-back-guarantee"
              className="scroll-mt-28 rounded-[24px] border-2 border-ink bg-yellow p-5 xsmall:p-7 small:rounded-[32px] small:p-10"
            >
              <div className="flex flex-col gap-6 small:flex-row small:items-start small:justify-between">
                <div className="max-w-[720px]">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-dark">
                    First-order reassurance
                  </p>
                  <h2 className="mt-2 font-display text-[30px] font-bold leading-[1.1] tracking-[-0.035em] xsmall:text-[34px] small:text-[40px]">
                    Try your litter box with less worry
                  </h2>
                </div>
                <div className="inline-flex min-h-12 shrink-0 items-center gap-3 self-start rounded-[14px] border border-ink/20 bg-white px-4 text-sm font-bold text-ink">
                  <ShoppingBag aria-hidden="true" />
                  15-Day Money-Back Guarantee
                </div>
              </div>
              <p className="mt-6 max-w-[820px] text-base leading-7 text-ink/80 small:text-[17px] small:leading-8">
                If you are not satisfied, you may request a refund within 15
                calendar days of delivery of your first order. This guarantee is
                limited to one litter box and one bag of litter. Send us a
                message and our customer care team will help you get started.
              </p>
            </section>

            <section
              id="return-eligibility"
              className="scroll-mt-28 rounded-[24px] border border-[#E6E8EC] bg-white p-5 shadow-[0_8px_24px_rgba(32,36,51,0.06)] xsmall:p-7 small:rounded-[32px] small:p-10"
            >
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-mint text-ink">
                  <ExclamationCircleSolid aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
                    The essentials
                  </p>
                  <h2 className="mt-2 font-display text-[30px] font-bold leading-[1.1] tracking-[-0.035em] xsmall:text-[34px] small:text-[40px]">
                    Return eligibility
                  </h2>
                </div>
              </div>

              <ul className="mt-7 space-y-3 small:ml-[60px]">
                {eligibilityItems.map((item, index) => (
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
              id="refund-details"
              className="scroll-mt-28 rounded-[24px] border border-[#E6E8EC] bg-white p-5 shadow-[0_8px_24px_rgba(32,36,51,0.06)] xsmall:p-7 small:rounded-[32px] small:p-10"
            >
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
                What happens next
              </p>
              <h2 className="mt-2 font-display text-[30px] font-bold leading-[1.1] tracking-[-0.035em] xsmall:text-[34px] small:text-[40px]">
                Refunds, shipping, and exchanges
              </h2>
              <ul className="mt-7 grid gap-3 medium:grid-cols-2">
                {refundItems.map((item) => (
                  <li
                    key={item.title}
                    className="rounded-[16px] border border-[#E6E8EC] bg-cream p-5"
                  >
                    <span
                      aria-hidden="true"
                      className={`block h-2 w-12 rounded-full ${item.accent}`}
                    />
                    <h3 className="mt-4 font-display text-lg font-bold">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-base leading-7 text-muted">
                      {item.description}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <section
              id="order-changes"
              className="scroll-mt-28 rounded-[24px] border border-[#E6E8EC] bg-white p-5 shadow-[0_8px_24px_rgba(32,36,51,0.06)] xsmall:p-7 small:rounded-[32px] small:p-10"
            >
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
                Before fulfillment
              </p>
              <h2 className="mt-2 font-display text-[30px] font-bold leading-[1.1] tracking-[-0.035em] xsmall:text-[34px] small:text-[40px]">
                Cancellations and address changes
              </h2>
              <div className="mt-7 grid gap-4 medium:grid-cols-2">
                <div className="rounded-[20px] bg-sky p-5 xsmall:p-6">
                  <h3 className="font-display text-xl font-bold">
                    Cancel an order
                  </h3>
                  <p className="mt-3 text-base leading-7 text-ink/75">
                    Contact us as soon as possible. We can accept a cancellation
                    request only before the order enters fulfillment.
                  </p>
                </div>
                <div className="rounded-[20px] bg-mint p-5 xsmall:p-6">
                  <h3 className="font-display text-xl font-bold">
                    Change an address
                  </h3>
                  <p className="mt-3 text-base leading-7 text-ink/75">
                    Contact us promptly if the shipping address needs to change.
                    Address updates are available only before fulfillment begins.
                  </p>
                </div>
              </div>
            </section>

            <section
              id="order-issues"
              className="scroll-mt-28 rounded-[24px] border border-[#E6E8EC] bg-white p-5 shadow-[0_8px_24px_rgba(32,36,51,0.06)] xsmall:p-7 small:rounded-[32px] small:p-10"
            >
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-coral text-ink">
                  <ExclamationCircleSolid aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
                    We will help make it right
                  </p>
                  <h2 className="mt-2 font-display text-[30px] font-bold leading-[1.1] tracking-[-0.035em] xsmall:text-[34px] small:text-[40px]">
                    Incorrect, missing, or damaged items
                  </h2>
                </div>
              </div>
              <div className="mt-7 space-y-4 text-base leading-7 text-muted small:ml-[60px] small:text-[17px] small:leading-8">
                <p>
                  Report an incorrect, missing, or damaged item to PetBoxNest
                  within 7 calendar days of delivery. Include your order number,
                  a description of the issue, and clear photos when applicable.
                </p>
                <p>
                  For confirmed incorrect, missing, or damaged items, including
                  items with manufacturing defects, PetBoxNest will cover
                  reasonable return or replacement shipping costs and provide
                  the appropriate resolution.
                </p>
              </div>
            </section>

            <section
              id="how-to-return"
              className="scroll-mt-28 rounded-[24px] border border-[#E6E8EC] bg-white p-5 shadow-[0_8px_24px_rgba(32,36,51,0.06)] xsmall:p-7 small:rounded-[32px] small:p-10"
            >
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
                Four simple steps
              </p>
              <h2 className="mt-2 font-display text-[30px] font-bold leading-[1.1] tracking-[-0.035em] xsmall:text-[34px] small:text-[40px]">
                How to make a return
              </h2>
              <ol className="mt-7 grid gap-4 medium:grid-cols-2">
                {returnSteps.map((step, index) => (
                  <li
                    key={step.title}
                    className="rounded-[20px] border border-[#E6E8EC] bg-cream p-5 xsmall:p-6"
                  >
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
                      Step {index + 1}
                    </span>
                    <h3 className="mt-2 font-display text-xl font-bold">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-base leading-7 text-muted">
                      {step.description}
                    </p>
                  </li>
                ))}
              </ol>
              <LocalizedClientLink
                href="/contact"
                className="pbn-focus mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-brand px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-brand-dark motion-reduce:transition-none"
              >
                Contact customer care <ArrowRight aria-hidden="true" />
              </LocalizedClientLink>
            </section>
          </article>
        </div>
      </div>
    </main>
  )
}
