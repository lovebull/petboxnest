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
      "Read the terms governing use of PetBoxNest, product purchases, payments, shipping, returns, account activity, recurring plans, and user content.",
  })
}

const policyLinks = [
  { id: "acceptance", label: "Acceptance of terms" },
  { id: "scope", label: "Scope of services" },
  { id: "website-content", label: "Website content" },
  { id: "accounts-and-sales", label: "Accounts and product sales" },
  { id: "recurring-orders", label: "Recurring orders" },
  { id: "billing-and-payments", label: "Billing and payments" },
  { id: "renewals", label: "Recurring plan renewals" },
  { id: "shipping-and-risk", label: "Shipping and risk" },
  { id: "international-access", label: "International access" },
  { id: "cancellations", label: "Cancellations" },
  { id: "user-content", label: "Content submitted by users" },
  { id: "prohibited-content", label: "Prohibited content" },
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
              These terms govern your use of the PetBoxNest storefront and
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
              September 11, 2026
            </p>
            <p className="mt-5 border-t border-white/15 pt-5 text-sm leading-6 text-white/70">
              The rules for using our storefront and shopping directly with
              PetBoxNest.
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
            <section className="rounded-[24px] border-2 border-ink bg-yellow p-5 xsmall:p-7 small:rounded-[32px] small:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-dark">
                Effective September 11, 2026
              </p>
              <h2 className="mt-3 font-display text-[30px] font-bold leading-[1.1] tracking-[-0.035em] xsmall:text-[34px] small:text-[40px]">
                Welcome to PetBoxNest
              </h2>
              <p className="mt-5 max-w-[820px] text-base leading-7 text-ink/80 small:text-[17px] small:leading-8">
                These Terms of Service apply when you visit our website, create
                an account, submit content, or buy products from PetBoxNest.
                Please read them together with the policies linked below. If you
                do not agree, do not use the storefront or place an order.
              </p>
              <p className="mt-5 rounded-[16px] bg-white p-5 text-sm font-bold uppercase leading-6 tracking-[0.04em] text-ink">
                Important: these terms include warranty disclaimers and limits
                on liability. Nothing in these terms limits rights that cannot
                legally be waived.
              </p>
            </section>

            <PolicyCard id="acceptance" title="Acceptance of terms" index={0}>
              <p>
                By accessing or using the PetBoxNest website, purchasing a
                product, creating an account, or submitting content, you agree
                to these Terms of Service and the policies incorporated into
                them. If you use the storefront for an organization, you confirm
                that you are authorized to bind that organization.
              </p>
              <p>
                You must be legally capable of entering into a binding agreement
                in your jurisdiction. If you are not, you may use the storefront
                only with the involvement of a parent or legal guardian.
              </p>
            </PolicyCard>

            <PolicyCard id="scope" title="Scope of services" index={1}>
              <p>
                PetBoxNest provides an online storefront for browsing and
                purchasing pet and home products, managing eligible account
                features, contacting customer care, and interacting with content
                we make available. Features may change, be suspended, or be
                discontinued as the storefront develops.
              </p>
              <p>
                We may use service providers for hosting, payments, order
                fulfillment, shipping, analytics, communications, and other
                operational functions. Their services may be subject to
                additional terms and privacy notices.
              </p>
            </PolicyCard>

            <PolicyCard id="website-content" title="Website content" index={2}>
              <p>
                We work to keep descriptions, photographs, dimensions, prices,
                availability, and other storefront information accurate.
                However, colors and details may vary by device, and typographical
                or technical errors may occur. We may correct errors and update
                content without prior notice.
              </p>
              <p>
                Storefront content is provided for general product and shopping
                information. It is not veterinary, medical, legal, or other
                professional advice. Contact an appropriate professional when
                your pet has a health or safety concern.
              </p>
            </PolicyCard>

            <PolicyCard
              id="accounts-and-sales"
              title="Registration, accounts, and product sales"
              index={3}
            >
              <p>
                You agree to provide current, complete, and accurate account,
                delivery, and billing information. You are responsible for
                protecting your sign-in credentials and for activity performed
                through your account. Tell us promptly if you suspect
                unauthorized access.
              </p>
              <p>
                Placing an order is an offer to purchase. An order confirmation
                only acknowledges receipt and does not guarantee acceptance. We
                may limit quantities or refuse or cancel an order for payment
                failure, suspected fraud, pricing or inventory errors, resale
                activity, legal restrictions, or another legitimate reason. If
                we cancel after capturing payment, we will issue the appropriate
                refund.
              </p>
            </PolicyCard>

            <PolicyCard
              id="recurring-orders"
              title="Recurring orders and scheduled delivery"
              index={4}
            >
              <p>
                PetBoxNest may make recurring delivery available for eligible
                products. A paid recurring plan applies only when its price,
                delivery frequency, renewal terms, and cancellation method are
                clearly presented at checkout and you affirmatively enroll.
                Signing up for marketing emails does not create a paid recurring
                plan.
              </p>
              <p>
                Product selection, availability, taxes, shipping charges, and
                delivery dates may vary as disclosed for the applicable plan.
                We will not substitute a materially different product without
                notice or permission where required.
              </p>
            </PolicyCard>

            <PolicyCard
              id="billing-and-payments"
              title="Billing and payments"
              index={5}
            >
              <p>
                You authorize PetBoxNest and its payment providers to charge the
                payment method selected at checkout for the displayed product
                price, shipping, taxes, and other disclosed charges. You confirm
                that you are authorized to use that payment method.
              </p>
              <p>
                If a payment is declined, reversed, or otherwise unsuccessful,
                we may pause fulfillment, request another payment method, or
                cancel the affected order. Payment information is processed by
                our payment providers in accordance with their applicable terms
                and privacy notices.
              </p>
            </PolicyCard>

            <PolicyCard
              id="renewals"
              title="Recurring plan renewals"
              index={6}
            >
              <p>
                If you enroll in a recurring plan, it will renew and charge at
                the price and frequency disclosed when you enroll until it is
                canceled. Material terms, including renewal charges and how to
                cancel, must be displayed before enrollment, and your express
                consent is required before recurring billing begins.
              </p>
              <p>
                You may stop future renewals using the cancellation method shown
                when you enroll or by contacting customer care. A cancellation
                received after an order has entered fulfillment applies to
                future renewals and does not automatically cancel the order
                already being processed.
              </p>
            </PolicyCard>

            <PolicyCard
              id="shipping-and-risk"
              title="Shipping, returns, and risk of loss"
              index={7}
            >
              <p>
                Delivery dates are estimates and may be affected by carriers,
                weather, address issues, inventory, or events outside our
                reasonable control. If we cannot ship within the promised time,
                we will provide the choices and refund required by applicable
                law.
              </p>
              <p>
                Eligible unused items may be returned within 15 calendar days of
                confirmed delivery. Details about eligibility, return shipping,
                damaged or incorrect items, and refund timing appear in our{" "}
                <LocalizedClientLink
                  href="/refund-policy"
                  className="pbn-focus font-bold text-brand underline underline-offset-4"
                >
                  Returns &amp; Refunds Policy
                </LocalizedClientLink>
                . Delivery terms appear in our{" "}
                <LocalizedClientLink
                  href="/shipping-policy"
                  className="pbn-focus font-bold text-brand underline underline-offset-4"
                >
                  Shipping Policy
                </LocalizedClientLink>
                , and manufacturing-defect coverage appears in our{" "}
                <LocalizedClientLink
                  href="/warranty"
                  className="pbn-focus font-bold text-brand underline underline-offset-4"
                >
                  Warranty
                </LocalizedClientLink>
                . These policies form part of these terms.
              </p>
            </PolicyCard>

            <PolicyCard
              id="international-access"
              title="International access"
              index={8}
            >
              <p>
                The storefront is operated for the markets and delivery
                destinations shown at checkout. Access from another country does
                not mean that every product, feature, price, promotion, or
                shipping method is available there.
              </p>
              <p>
                You are responsible for complying with local laws that apply to
                your access and purchase. Duties, taxes, customs charges, and
                import restrictions apply only as disclosed or required for the
                destination.
              </p>
            </PolicyCard>

            <PolicyCard
              id="cancellations"
              title="Order and recurring plan cancellations"
              index={9}
            >
              <p>
                Contact customer care as soon as possible to request an order
                cancellation or address change. We can accept the request only
                before the order enters fulfillment. Once fulfillment begins,
                the applicable return policy governs.
              </p>
              <p>
                Canceling a recurring plan stops eligible future renewals; it
                does not retroactively cancel charges or shipments already
                processed. If PetBoxNest cancels an order after payment has been
                captured, we will issue the appropriate refund to the original
                payment method.
              </p>
            </PolicyCard>

            <PolicyCard
              id="user-content"
              title="Content submitted by users"
              index={10}
            >
              <p>
                Reviews, photographs, comments, profile information, support
                messages, and other material you submit remain yours. You grant
                PetBoxNest a non-exclusive, worldwide, royalty-free license to
                host, reproduce, format, display, and use that content as needed
                to operate, improve, and promote the storefront and products,
                subject to our Privacy Policy and applicable law.
              </p>
              <p>
                You confirm that you own or have permission to submit the
                content and that our permitted use will not violate another
                person&apos;s rights. We may moderate, refuse, or remove content
                that violates these terms, but we are not required to publish
                every submission.
              </p>
            </PolicyCard>

            <PolicyCard
              id="prohibited-content"
              title="Prohibited content and conduct"
              index={11}
            >
              <p>You must not submit content or use the storefront to:</p>
              <ul className="list-disc space-y-2 pl-5 marker:text-brand marker:text-lg">
                <li>
                  Engage in unlawful, fraudulent, deceptive, threatening,
                  harassing, hateful, or abusive activity.
                </li>
                <li>
                  Infringe privacy, publicity, copyright, trademark, or other
                  rights.
                </li>
                <li>
                  Upload malware, harmful code, spam, false reviews, or
                  misleading product claims.
                </li>
                <li>
                  Attempt unauthorized access, interfere with security or
                  availability, scrape data at disruptive scale, or evade access
                  controls.
                </li>
                <li>
                  Impersonate another person, collect personal information
                  without permission, or use the storefront for unauthorized
                  commercial solicitation.
                </li>
              </ul>
            </PolicyCard>

            <PolicyCard
              id="intellectual-property"
              title="Intellectual property"
              index={12}
            >
              <p>
                The PetBoxNest name, site design, text, graphics, product
                imagery, and other original content are owned by or licensed to
                PetBoxNest and are protected by applicable intellectual-property
                laws. Personal, noncommercial viewing is permitted; no other
                license is granted.
              </p>
            </PolicyCard>

            <PolicyCard
              id="disclaimers-and-liability"
              title="Disclaimers and liability"
              index={13}
            >
              <p>
                To the extent permitted by law, the storefront is provided “as
                is” and “as available.” We do not guarantee uninterrupted or
                error-free operation. PetBoxNest will not be liable for
                indirect, incidental, special, or consequential losses arising
                from use of the storefront or products where such limitations
                are legally permitted.
              </p>
              <p>
                Nothing in these terms excludes warranties, remedies, consumer
                rights, or liability that cannot legally be excluded or limited.
              </p>
            </PolicyCard>

            <PolicyCard
              id="governing-law-and-changes"
              title="Governing law and changes"
              index={14}
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
                support@petboxnest.com.
              </p>
            </PolicyCard>
          </article>
        </div>
      </div>
    </main>
  )
}
