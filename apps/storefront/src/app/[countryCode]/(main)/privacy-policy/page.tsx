import type { ReactNode } from "react"
import { createMarketingMetadata } from "@lib/util/seo-metadata"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  ArrowRight,
  ChatBubbleLeftRight,
  Clock,
  ShieldCheck,
} from "@medusajs/icons"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  return createMarketingMetadata({
    countryCode: (await params).countryCode,
    path: "privacy-policy",
    title: "Privacy Policy | PetBoxNest",
    description:
      "Understand what personal information PetBoxNest collects, how it is used and shared, and the privacy choices available to U.S. customers.",
  })
}

const policyLinks = [
  { id: "information-we-collect", label: "Information we collect" },
  { id: "how-we-use-information", label: "How we use information" },
  { id: "how-information-is-shared", label: "How information is shared" },
  { id: "cookies-and-choices", label: "Cookies and choices" },
  { id: "your-privacy-rights", label: "Your privacy rights" },
  {
    id: "retention-security-and-children",
    label: "Retention, security, and children",
  },
  { id: "policy-changes-and-contact", label: "Policy changes and contact" },
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
  const accents = ["bg-mint", "bg-yellow", "bg-sky"]

  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-[24px] border border-[#E6E8EC] bg-white p-5 shadow-[0_8px_24px_rgba(32,36,51,0.06)] xsmall:p-7 small:rounded-[32px] small:p-10"
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-[14px] font-display text-sm font-bold text-ink ${
            accents[index % accents.length]
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <h2 className="pt-1 font-display text-[28px] font-bold leading-[1.12] tracking-[-0.035em] text-ink xsmall:text-[32px] small:text-[38px]">
          {title}
        </h2>
      </div>
      <div className="mt-6 space-y-5 text-base leading-7 text-muted small:ml-[60px] small:text-[17px] small:leading-8">
        {children}
      </div>
    </section>
  )
}

const bulletListClassName =
  "list-disc space-y-2 pl-5 marker:text-brand marker:text-lg"

export default function PrivacyPolicyPage() {
  return (
    <main className="overflow-x-clip bg-cream text-ink">
      <header className="relative overflow-hidden border-b border-[#E6E8EC] bg-cream">
        <div
          aria-hidden="true"
          className="absolute -right-24 top-14 h-64 w-64 rounded-full bg-sky/70 small:right-8 small:h-80 small:w-80"
        />
        <div
          aria-hidden="true"
          className="absolute -left-24 bottom-[-120px] h-64 w-64 rounded-full bg-mint/70"
        />

        <div className="pbn-container relative grid gap-10 py-14 small:grid-cols-[minmax(0,1fr)_360px] small:items-end small:py-24 medium:grid-cols-[minmax(0,1fr)_400px] medium:py-28">
          <div>
            <p className="inline-flex min-h-10 items-center gap-2 rounded-full bg-mint px-4 text-xs font-bold uppercase tracking-[0.16em] text-ink">
              <ShieldCheck aria-hidden="true" />
              Legal
            </p>
            <h1 className="mt-6 max-w-[820px] text-balance font-display text-[44px] font-bold leading-[1.02] tracking-[-0.05em] xsmall:text-[56px] small:text-[72px] medium:text-[80px]">
              Privacy policy
            </h1>
            <p className="mt-6 max-w-[680px] text-lg leading-8 text-muted small:text-xl small:leading-9">
              This policy explains how Petboxnest collects, uses, discloses, and
              protects personal information when you visit our storefront or
              purchase from us.
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
              A clear guide to the information behind your Petboxnest shopping
              experience.
            </p>
          </aside>
        </div>
      </header>

      <div className="bg-mist py-14 small:py-20 medium:py-24">
        <div className="pbn-container grid min-w-0 gap-8 small:grid-cols-[280px_minmax(0,1fr)] small:items-start small:gap-10 medium:gap-14">
          <aside className="min-w-0 space-y-5 small:sticky small:top-28">
            <nav
              aria-label="Privacy policy sections"
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
              id="information-we-collect"
              title="Information we collect"
              index={0}
            >
              <ul className={bulletListClassName}>
                <li>
                  Contact and account details, including your name, email,
                  telephone number, billing address, and shipping address.
                </li>
                <li>
                  Order and transaction details. Payment card information is
                  processed by our payment providers and is not stored in full
                  by us.
                </li>
                <li>
                  Device, browser, IP address, cookie, and storefront
                  interaction data collected when you use the site.
                </li>
                <li>
                  Communications you send to customer care, including return and
                  warranty requests.
                </li>
              </ul>
            </PolicyCard>

            <PolicyCard
              id="how-we-use-information"
              title="How we use information"
              index={1}
            >
              <p>We use personal information to:</p>
              <ul className={bulletListClassName}>
                <li>
                  Process orders, payments, delivery, returns, and refunds.
                </li>
                <li>Provide account features and customer support.</li>
                <li>
                  Prevent fraud, secure the storefront, and comply with law.
                </li>
                <li>
                  Improve products, site performance, and the shopping
                  experience.
                </li>
                <li>
                  Send marketing communications where permitted. You may
                  unsubscribe at any time using the link in those messages.
                </li>
              </ul>
            </PolicyCard>

            <PolicyCard
              id="how-information-is-shared"
              title="How information is shared"
              index={2}
            >
              <p>
                We share information only as reasonably necessary with service
                providers that support payment processing, fraud prevention,
                analytics, order fulfillment, delivery, email, and hosting. We
                may also disclose information when required by law, to protect
                rights and safety, or as part of a business transfer.
              </p>
              <p>
                We do not sell personal information for money. Some analytics or
                advertising activity may be considered sharing under certain
                U.S. state privacy laws, where applicable.
              </p>
            </PolicyCard>

            <PolicyCard
              id="cookies-and-choices"
              title="Cookies and choices"
              index={3}
            >
              <p>
                Cookies help keep the cart working, remember preferences,
                understand site performance, and measure marketing. Browser
                settings can block or delete cookies, although essential
                storefront features may then stop working correctly.
              </p>
            </PolicyCard>

            <PolicyCard
              id="your-privacy-rights"
              title="Your privacy rights"
              index={4}
            >
              <p>
                Depending on where you live, you may have the right to request
                access, correction, deletion, or a copy of personal information,
                and to opt out of certain uses or sharing. We will verify
                requests as required and will not discriminate against you for
                exercising applicable rights.
              </p>
              <p>
                Submit a request to support@Petboxnest.com with the subject
                “Privacy Request.” An authorized agent may submit a request
                where permitted by law.
              </p>
            </PolicyCard>

            <PolicyCard
              id="retention-security-and-children"
              title="Retention, security, and children"
              index={5}
            >
              <p>
                We retain information only as long as reasonably needed for the
                purposes described here, including legal, tax, fraud-prevention,
                and dispute requirements. We use reasonable administrative and
                technical safeguards, but no internet transmission is completely
                secure.
              </p>
              <p>
                The storefront is not directed to children under 13, and we do
                not knowingly collect their personal information.
              </p>
            </PolicyCard>

            <PolicyCard
              id="policy-changes-and-contact"
              title="Policy changes and contact"
              index={6}
            >
              <p>
                We may update this policy to reflect operational, legal, or
                technical changes. The date at the top shows the latest
                revision. Questions may be sent to support@Petboxnest.com.
              </p>
            </PolicyCard>
          </article>
        </div>
      </div>
    </main>
  )
}
