import type { ReactNode } from "react"
import { createMarketingMetadata } from "@lib/util/seo-metadata"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  ArrowRight,
  ChatBubbleLeftRight,
  Clock,
  DocumentText,
} from "@medusajs/icons"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  return createMarketingMetadata({
    countryCode: (await params).countryCode,
    path: "terms-of-service",
    title: "Terms of Service | PetBoxNest",
    description:
      "Read the terms governing use of the PetBoxNest website, product purchases, payments, shipping, returns, and account activity.",
  })
}

const policyLinks = [
  { id: "store-use-and-eligibility", label: "Store use and eligibility" },
  {
    id: "products-prices-and-availability",
    label: "Products, prices, and availability",
  },
  { id: "orders-and-payment", label: "Orders and payment" },
  {
    id: "shipping-returns-and-warranty",
    label: "Shipping, returns, and warranty",
  },
  {
    id: "accounts-and-prohibited-conduct",
    label: "Accounts and prohibited conduct",
  },
  { id: "intellectual-property", label: "Intellectual property" },
  { id: "disclaimers-and-liability", label: "Disclaimers and liability" },
  { id: "governing-law-and-changes", label: "Governing law and changes" },
]

function PolicyCard({
  id,
  title,
  index,
  children,
}: {
  id: string
  title: string
  index: number
  children: ReactNode
}) {
  const accents = ["bg-yellow", "bg-sky", "bg-mint"]

  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-[24px] border border-[#E6E8EC] bg-white p-5 shadow-[0_8px_24px_rgba(32,36,51,0.06)] xsmall:p-7 small:rounded-[32px] small:p-10"
    >
      <h2 className="flex items-start gap-4 font-display text-[28px] font-bold leading-[1.12] tracking-[-0.035em] text-ink xsmall:text-[32px] small:text-[38px]">
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-[14px] text-sm ${
            accents[index % accents.length]
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="pt-1">{title}</span>
      </h2>
      <div className="mt-6 space-y-5 text-base leading-7 text-muted small:ml-[60px] small:text-[17px] small:leading-8">
        {children}
      </div>
    </section>
  )
}

export default function TermsOfServicePage() {
  return (
    <main className="overflow-x-clip bg-cream text-ink">
      <header className="relative overflow-hidden border-b border-[#E6E8EC] bg-cream">
        <div
          aria-hidden="true"
          className="absolute -right-24 top-14 h-64 w-64 rounded-full bg-yellow/65 small:right-8 small:h-80 small:w-80"
        />
        <div
          aria-hidden="true"
          className="absolute -left-24 bottom-[-120px] h-64 w-64 rounded-full bg-sky/70"
        />

        <div className="pbn-container relative grid gap-10 py-14 small:grid-cols-[minmax(0,1fr)_360px] small:items-end small:py-24 medium:grid-cols-[minmax(0,1fr)_400px] medium:py-28">
          <div>
            <p className="inline-flex min-h-10 items-center gap-2 rounded-full bg-mint px-4 text-xs font-bold uppercase tracking-[0.16em] text-ink">
              <DocumentText aria-hidden="true" />
              Legal
            </p>
            <h1 className="mt-6 max-w-[820px] text-balance font-display text-[44px] font-bold leading-[1.02] tracking-[-0.05em] xsmall:text-[56px] small:text-[72px] medium:text-[80px]">
              Terms of service
            </h1>
            <p className="mt-6 max-w-[680px] text-lg leading-8 text-muted small:text-xl small:leading-9">
              These terms govern your use of the Petboxnest storefront and
              purchases made directly from us. By using the site, you agree to
              these terms.
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
            <p className="mt-5 border-t border-white/15 pt-5 text-sm leading-6 text-white/70">
              The rules for using our storefront and shopping directly with
              Petboxnest.
            </p>
          </aside>
        </div>
      </header>

      <div className="bg-mist py-14 small:py-20 medium:py-24">
        <div className="pbn-container grid min-w-0 gap-8 small:grid-cols-[280px_minmax(0,1fr)] small:items-start small:gap-10 medium:gap-14">
          <aside className="min-w-0 space-y-5 small:sticky small:top-28">
            <nav
              aria-label="Terms of service sections"
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
            <PolicyCard
              id="store-use-and-eligibility"
              title="Store use and eligibility"
              index={0}
            >
              <p>
                You may use the storefront only for lawful personal shopping.
                You must provide current and accurate information and be legally
                capable of entering into a binding agreement in your
                jurisdiction.
              </p>
            </PolicyCard>

            <PolicyCard
              id="products-prices-and-availability"
              title="Products, prices, and availability"
              index={1}
            >
              <p>
                We work to present product descriptions, images, prices, and
                availability accurately. Colors and details may appear
                differently depending on your device. We may correct errors,
                update information, limit quantities, or discontinue products
                without prior notice.
              </p>
            </PolicyCard>

            <PolicyCard
              id="orders-and-payment"
              title="Orders and payment"
              index={2}
            >
              <p>
                An order confirmation acknowledges that we received your order;
                it does not guarantee acceptance. We may refuse or cancel an
                order for suspected fraud, payment failure, pricing error,
                inventory shortage, resale activity, or other legitimate
                reasons. If payment was captured for a canceled order, it will
                be refunded.
              </p>
              <p>
                You authorize us and our payment providers to charge the payment
                method selected at checkout, including applicable taxes and
                shipping.
              </p>
            </PolicyCard>

            <PolicyCard
              id="shipping-returns-and-warranty"
              title="Shipping, returns, and warranty"
              index={3}
            >
              <p>
                Delivery estimates are not guaranteed and may be affected by
                carriers or events outside our reasonable control. Our Shipping
                Policy, Refund Policy, and Warranty form part of these terms.
              </p>
            </PolicyCard>

            <PolicyCard
              id="accounts-and-prohibited-conduct"
              title="Accounts and prohibited conduct"
              index={4}
            >
              <p>
                You are responsible for activity under your account and must
                not:
              </p>
              <ul className="list-disc space-y-2 pl-5 marker:text-brand marker:text-lg">
                <li>
                  Use the storefront for unlawful, fraudulent, or abusive
                  activity.
                </li>
                <li>
                  Attempt to access accounts, data, or systems without
                  authorization.
                </li>
                <li>
                  Interfere with storefront security, availability, or
                  operation.
                </li>
                <li>
                  Copy, scrape, resell, or exploit site content without
                  permission.
                </li>
                <li>
                  Upload malicious code or infringe another person's rights.
                </li>
              </ul>
            </PolicyCard>

            <PolicyCard
              id="intellectual-property"
              title="Intellectual property"
              index={5}
            >
              <p>
                The Petboxnest name, site design, text, graphics, product
                imagery, and other original content are owned by or licensed to
                Petboxnest and are protected by applicable intellectual-property
                laws. Personal, noncommercial viewing is permitted; no other
                license is granted.
              </p>
            </PolicyCard>

            <PolicyCard
              id="disclaimers-and-liability"
              title="Disclaimers and liability"
              index={6}
            >
              <p>
                To the extent permitted by law, the storefront is provided “as
                is” and “as available.” We do not guarantee uninterrupted or
                error-free operation. Petboxnest will not be liable for
                indirect, incidental, special, or consequential losses arising
                from use of the storefront or products where such limitations
                are legally permitted.
              </p>
              <p>
                Nothing in these terms excludes warranties, remedies, or
                liability that cannot legally be excluded or limited.
              </p>
            </PolicyCard>

            <PolicyCard
              id="governing-law-and-changes"
              title="Governing law and changes"
              index={7}
            >
              <p>
                These terms are governed by applicable U.S. federal and state
                laws, without regard to conflict-of-law principles. We may
                update the terms by posting a revised version and changing the
                date above. Continued use after an update constitutes acceptance
                where permitted by law.
              </p>
              <p>
                Questions about these terms may be sent to
                support@Petboxnest.com.
              </p>
            </PolicyCard>
          </article>
        </div>
      </div>
    </main>
  )
}
