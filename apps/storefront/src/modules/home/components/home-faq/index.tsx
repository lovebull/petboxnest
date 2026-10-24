import { ArrowRight, ChevronDown } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const questions = [
  {
    question: "How do I know my order was received?",
    answer:
      "After checkout, you will see an order confirmation and receive a confirmation email. If it does not arrive within an hour, check your spam folder or contact us.",
    detailLink: {
      href: "/faq#orders-and-payment",
      label: "More order answers",
    },
  },
  {
    question: "When will my order ship?",
    answer:
      "Orders are generally processed within one to two business days. Orders placed on weekends or U.S. holidays begin processing on the next business day, and tracking is emailed when the carrier accepts your shipment.",
    detailLink: {
      href: "/shipping-policy#processing-and-delivery",
      label: "Read the Shipping Policy",
    },
  },
  {
    question: "Do you offer free shipping?",
    answer:
      "U.S. standard shipping is free on orders of $70 or more. Standard shipping is $9.99 for U.S. orders under $70, and checkout shows the available options and final charge.",
    detailLink: {
      href: "/shipping-policy#shipping-costs",
      label: "See shipping costs",
    },
  },
  {
    question: "What is your return window?",
    answer:
      "Eligible items may be returned within 15 calendar days of confirmed delivery. Items must be unused, clean, and undamaged, with their original packaging, accessories, and proof of purchase.",
    detailLink: {
      href: "/refund-policy#return-eligibility",
      label: "Check return eligibility",
    },
  },
  {
    question: "How long does a refund take?",
    answer:
      "After a returned item passes inspection, we initiate an approved refund to the original payment method within five business days. Your bank or payment provider may need another five to ten business days to post the credit.",
    detailLink: {
      href: "/refund-policy#refund-details",
      label: "Read the Returns & Refunds Policy",
    },
  },
]

const HomeFaq = () => {
  return (
    <section
      aria-labelledby="home-faq-heading"
      className="bg-cream py-16 text-ink small:py-24"
    >
      <div className="pbn-container">
        <header className="mx-auto max-w-[720px] text-center">
          <p className="inline-flex min-h-9 items-center rounded-full bg-yellow px-4 text-xs font-bold uppercase tracking-[0.16em] text-ink">
            Good to know
          </p>
          <h2
            id="home-faq-heading"
            className="mt-3 font-display text-[34px] font-bold leading-tight tracking-[-0.035em] small:text-[48px]"
          >
            Frequently asked questions
          </h2>
          <p className="mx-auto mt-4 max-w-[620px] text-base leading-7 text-ink/75 small:text-lg">
            Quick answers about orders, delivery, returns, and the details that
            make shopping feel easier.
          </p>
        </header>

        <div className="mx-auto mt-10 max-w-[1080px] space-y-3">
          {questions.map((item) => (
            <details
              key={item.question}
              className="group rounded-[18px] border border-ink/10 bg-white shadow-[0_8px_20px_rgba(32,36,51,0.06)] open:border-brand/30"
            >
              <summary className="pbn-focus flex min-h-[68px] cursor-pointer list-none items-center justify-between gap-5 rounded-[18px] px-5 py-4 text-left text-base font-bold leading-6 transition-colors hover:text-brand small:min-h-[76px] small:px-7 small:text-lg [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cream text-ink transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none">
                  <ChevronDown aria-hidden="true" />
                </span>
              </summary>
              <div className="space-y-3 px-5 pb-6 pr-16 text-base leading-7 text-muted small:px-7 small:pb-7 small:pr-24">
                <p>{item.answer}</p>
                <LocalizedClientLink
                  href={item.detailLink.href}
                  className="pbn-focus inline-flex min-h-11 items-center gap-2 rounded-lg font-bold text-brand underline decoration-brand/35 underline-offset-4 transition-colors hover:text-brand-dark hover:decoration-brand-dark"
                >
                  {item.detailLink.label}
                  <ArrowRight aria-hidden="true" />
                </LocalizedClientLink>
              </div>
            </details>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <LocalizedClientLink
            href="/faq"
            className="pbn-focus inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-ink px-7 text-sm font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-brand-dark motion-reduce:transition-none"
          >
            View all FAQs
            <ArrowRight aria-hidden="true" />
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}

export default HomeFaq
