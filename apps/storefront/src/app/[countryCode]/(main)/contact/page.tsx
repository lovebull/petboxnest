import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  ArrowRight,
  ChatBubbleLeftRight,
  Clock,
  Envelope,
  QuestionMarkCircle,
} from "@medusajs/icons"

export const metadata: Metadata = {
  title: "Contact Us | Petboxnest",
  description:
    "Contact Petboxnest customer care for help with orders, shipping, returns, warranty questions, and product information.",
}

const inputClasses =
  "pbn-focus min-h-[52px] w-full rounded-[14px] border border-[#E6E8EC] bg-white px-4 text-base text-ink outline-none transition-colors placeholder:text-muted focus:border-brand"

export default function ContactPage() {
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
              Submitting this form opens your email application with the details
              ready to send.
            </p>

            <form
              action="mailto:support@Petboxnest.com"
              method="post"
              encType="text/plain"
              aria-describedby="contact-form-description"
              className="mt-8 grid gap-6"
            >
              <div className="grid gap-6 xsmall:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-ink">
                  Name <span className="sr-only">required</span>
                  <input
                    className={inputClasses}
                    name="name"
                    autoComplete="name"
                    required
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold text-ink">
                  Email <span className="sr-only">required</span>
                  <input
                    className={inputClasses}
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-6 xsmall:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-ink">
                  Topic
                  <select
                    className={inputClasses}
                    name="topic"
                    defaultValue="Order support"
                  >
                    <option>Order support</option>
                    <option>Shipping or return</option>
                    <option>Product question</option>
                    <option>Warranty claim</option>
                    <option>Other</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-bold text-ink">
                  Order number
                  <span className="font-normal text-muted">(optional)</span>
                  <input className={inputClasses} name="order-number" />
                </label>
              </div>

              <label className="grid gap-2 text-sm font-bold text-ink">
                Message <span className="sr-only">required</span>
                <textarea
                  className={`${inputClasses} min-h-40 resize-y py-4`}
                  name="message"
                  required
                />
              </label>

              <button
                type="submit"
                className="pbn-primary-button w-full gap-2 xsmall:w-auto xsmall:justify-self-start"
              >
                Prepare email <ArrowRight aria-hidden="true" />
              </button>
            </form>
          </section>
        </div>
      </section>
    </main>
  )
}
