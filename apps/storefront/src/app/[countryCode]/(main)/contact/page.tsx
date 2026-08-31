import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Contact Us | Petboxnest",
  description:
    "Contact Petboxnest customer care for help with orders, shipping, returns, warranty questions, and product information.",
}

const inputClasses =
  "min-h-12 w-full border border-[#9f998a] bg-transparent px-4 text-base text-ui-fg-base outline-none transition-colors placeholder:text-ui-fg-muted focus:border-ui-fg-base focus:ring-1 focus:ring-ui-fg-base"

export default function ContactPage() {
  return (
    <article className="bg-[#f7f3e7] text-ui-fg-base">
      <header className="border-b border-[#ded8c8]">
        <div className="content-container py-16 small:py-24">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-ui-fg-muted">
            Customer care
          </p>
          <h1 className="mt-5 max-w-4xl font-serif text-[42px] font-normal leading-[1.05] tracking-[-0.03em] small:text-[72px]">
            How can we help?
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-ui-fg-subtle small:text-lg small:leading-8">
            Tell us what you need and include your order number when possible.
            We typically respond within one to two business days.
          </p>
        </div>
      </header>

      <div className="content-container grid gap-14 py-14 small:grid-cols-[minmax(240px,0.7fr)_minmax(0,1.3fr)] small:gap-24 small:py-24">
        <section>
          <h2 className="font-serif text-[30px] font-normal leading-tight tracking-[-0.02em]">
            Contact details
          </h2>
          <dl className="mt-7 space-y-7 text-sm leading-6">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-ui-fg-muted">
                Email
              </dt>
              <dd className="mt-2">
                <a
                  href="mailto:support@Petboxnest.com"
                  className="border-b border-ui-fg-base pb-0.5 hover:opacity-60"
                >
                  support@Petboxnest.com
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-ui-fg-muted">
                Hours
              </dt>
              <dd className="mt-2 text-ui-fg-subtle">
                Monday-Friday, 9:00 AM-5:00 PM ET
              </dd>
            </div>
          </dl>
          <p className="mt-9 max-w-sm text-sm leading-6 text-ui-fg-subtle">
            Looking for a quick answer? Visit our{" "}
            <LocalizedClientLink
              href="/faq"
              className="border-b border-ui-fg-base text-ui-fg-base hover:opacity-60"
            >
              FAQ
            </LocalizedClientLink>
            .
          </p>
        </section>

        <section aria-labelledby="contact-form-heading">
          <h2
            id="contact-form-heading"
            className="font-serif text-[30px] font-normal leading-tight tracking-[-0.02em]"
          >
            Send a message
          </h2>
          <p className="mt-3 text-sm leading-6 text-ui-fg-subtle">
            Submitting this form opens your email application with the details
            ready to send.
          </p>
          <form
            action="mailto:support@Petboxnest.com"
            method="post"
            encType="text/plain"
            className="mt-8 grid gap-6"
          >
            <div className="grid gap-6 xsmall:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                Name <span className="sr-only">required</span>
                <input className={inputClasses} name="name" required />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Email <span className="sr-only">required</span>
                <input
                  className={inputClasses}
                  name="email"
                  type="email"
                  inputMode="email"
                  required
                />
              </label>
            </div>
            <div className="grid gap-6 xsmall:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                Topic
                <select className={inputClasses} name="topic" defaultValue="Order support">
                  <option>Order support</option>
                  <option>Shipping or return</option>
                  <option>Product question</option>
                  <option>Warranty claim</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Order number <span className="font-normal text-ui-fg-muted">(optional)</span>
                <input className={inputClasses} name="order-number" />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-medium">
              Message <span className="sr-only">required</span>
              <textarea
                className={`${inputClasses} min-h-40 py-3`}
                name="message"
                required
              />
            </label>
            <button
              type="submit"
              className="min-h-12 justify-self-start bg-[#242321] px-9 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#47443f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Prepare email
            </button>
          </form>
        </section>
      </div>
    </article>
  )
}
