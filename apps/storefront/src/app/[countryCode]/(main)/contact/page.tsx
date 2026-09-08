import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ContactForm from "@modules/contact/components/contact-form"
import { createMarketingMetadata } from "@lib/util/seo-metadata"
import {
  ArrowRight,
  ChatBubbleLeftRight,
  Clock,
  Envelope,
  QuestionMarkCircle,
} from "@medusajs/icons"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  return createMarketingMetadata({
    countryCode: (await params).countryCode,
    path: "contact",
    title: "Contact Us | PetBoxNest",
    description:
      "Contact PetBoxNest customer care for help with orders, shipping, returns, warranty questions, and product information.",
  })
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params

  return (
    <main className="overflow-hidden bg-cream text-ink">
      <header className="border-b border-[#E6E8EC] bg-cream">
        <div className="pbn-container grid gap-10 py-14 small:grid-cols-[minmax(0,1fr)_360px] small:items-end small:py-24 medium:grid-cols-[minmax(0,1fr)_400px] medium:py-28">
          <div>
            <p className="inline-flex min-h-10 items-center gap-2 rounded-full bg-mint px-4 text-xs font-bold uppercase tracking-[0.16em] text-ink">
              <ChatBubbleLeftRight aria-hidden="true" />
              Customer care
            </p>
            <h1 className="mt-6 max-w-[820px] text-balance font-display text-[44px] font-bold leading-[1.02] tracking-[-0.05em] xsmall:text-[56px] small:text-[72px] medium:text-[80px]">
              How can we help?
            </h1>
            <p className="mt-6 max-w-[680px] text-lg leading-8 text-muted small:text-xl small:leading-9">
              Tell us what you need and include your order number when possible.
              We typically respond within one to two business days.
            </p>
          </div>

          <aside className="rounded-[24px] bg-brand p-6 text-white shadow-[0_16px_40px_rgba(32,36,51,0.12)] xsmall:p-8">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-yellow text-ink">
              <QuestionMarkCircle aria-hidden="true" />
            </span>
            <h2 className="mt-6 font-display text-[28px] font-bold leading-tight">
              Looking for a quick answer?
            </h2>
            <LocalizedClientLink
              href="/faq"
              className="pbn-focus mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-white px-6 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:bg-cream motion-reduce:transition-none"
            >
              Visit our FAQ. <ArrowRight aria-hidden="true" />
            </LocalizedClientLink>
          </aside>
        </div>
      </header>

      <section className="bg-mist py-14 small:py-20 medium:py-24">
        <div className="pbn-container grid gap-8 small:grid-cols-[320px_minmax(0,1fr)] small:items-start small:gap-10 medium:grid-cols-[360px_minmax(0,1fr)] medium:gap-12">
          <section className="rounded-[24px] bg-ink p-6 text-white shadow-[0_8px_24px_rgba(32,36,51,0.08)] xsmall:p-8 small:sticky small:top-28 small:rounded-[32px]">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-yellow text-ink">
              <Envelope aria-hidden="true" />
            </span>
            <h2 className="mt-6 font-display text-[30px] font-bold leading-tight tracking-[-0.03em]">
              Contact details
            </h2>

            <dl className="mt-7 space-y-4">
              <div className="rounded-[16px] border border-white/15 bg-white/5 p-4">
                <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-yellow">
                  <Envelope aria-hidden="true" />
                  Email
                </dt>
                <dd className="mt-3 break-words text-base leading-7">
                  <a
                    href="mailto:support@Petboxnest.com"
                    className="pbn-focus rounded-md font-bold text-white underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white"
                  >
                    support@Petboxnest.com
                  </a>
                </dd>
              </div>

              <div className="rounded-[16px] border border-white/15 bg-white/5 p-4">
                <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-yellow">
                  <Clock aria-hidden="true" />
                  Hours
                </dt>
                <dd className="mt-3 text-base leading-7 text-white/80">
                  Monday-Friday, 9:00 AM-5:00 PM ET
                </dd>
              </div>
            </dl>
          </section>

          <section
            aria-labelledby="contact-form-heading"
            className="rounded-[24px] border border-[#E6E8EC] bg-white p-5 shadow-[0_8px_24px_rgba(32,36,51,0.08)] xsmall:p-8 small:rounded-[32px] medium:p-12"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mint text-ink">
              <ChatBubbleLeftRight aria-hidden="true" />
            </span>
            <h2
              id="contact-form-heading"
              className="mt-6 font-display text-[32px] font-bold leading-tight tracking-[-0.035em] small:text-[42px]"
            >
              Send a message
            </h2>
            <p
              id="contact-form-description"
              className="mt-3 max-w-[680px] text-base leading-7 text-muted"
            >
              Send the details securely and our customer care team will follow up
              by email.
            </p>
            <div aria-describedby="contact-form-description">
              <ContactForm countryCode={countryCode} />
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
