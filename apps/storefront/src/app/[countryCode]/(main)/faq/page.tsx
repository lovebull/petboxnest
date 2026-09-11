import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { createMarketingMetadata } from "@lib/util/seo-metadata"
import {
  ArrowPath,
  ArrowRight,
  ChatBubbleLeftRight,
  ChevronDown,
  CreditCard,
  QuestionMarkCircle,
  TruckFast,
} from "@medusajs/icons"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  return createMarketingMetadata({
    countryCode: (await params).countryCode,
    path: "faq",
    title: "FAQ | PetBoxNest",
    description:
      "Find answers about PetBoxNest orders, payments, shipping, returns, product availability, and warranties.",
  })
}

const faqGroups = [
  {
    id: "orders-and-payment",
    title: "Orders and payment",
    icon: CreditCard,
    accent: "bg-yellow",
    items: [
      {
        question: "How do I know my order was received?",
        answer:
          "After checkout, you will see an order confirmation and receive a confirmation email. Check your spam folder and contact us if the email does not arrive within an hour.",
      },
      {
        question: "Can I change or cancel an order?",
        answer:
          "Contact us as soon as possible. We can accept a cancellation or change request only before the order enters fulfillment.",
        detailLink: {
          href: "/refund-policy",
          label: "Read the Returns & Refunds Policy.",
        },
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "Available payment methods are displayed securely at checkout and may vary by device or order. We do not store complete payment card details on the storefront.",
      },
      {
        question: "Can I change the shipping address on my order?",
        answer:
          "Contact us promptly. We can update an address only before fulfillment begins.",
        detailLink: {
          href: "/refund-policy",
          label: "Read the Returns & Refunds Policy.",
        },
      },
    ],
  },
  {
    id: "shipping-and-delivery",
    title: "Shipping and delivery",
    icon: TruckFast,
    accent: "bg-sky",
    items: [
      {
        question: "When will my order ship?",
        answer:
          "Most orders are processed within one to two business days. Peak periods may take longer, and we will email tracking information when the carrier accepts your shipment.",
        detailLink: {
          href: "/shipping-policy",
          label: "Read the Shipping Policy.",
        },
      },
      {
        question: "Do you offer free shipping?",
        answer:
          "Standard shipping is free on qualifying U.S. orders of $100 or more. The checkout page shows the current shipping options and final cost.",
        detailLink: {
          href: "/shipping-policy",
          label: "Read the Shipping Policy.",
        },
      },
      {
        question: "What should I do if tracking says delivered?",
        answer:
          "Check the delivery area, household members, neighbors, and carrier notices, then allow up to 48 hours. If it is still missing, contact us with your order number and tracking details.",
        detailLink: {
          href: "/refund-policy",
          label: "Read the Returns & Refunds Policy.",
        },
      },
      {
        question: "What if my package is missing or an item is damaged?",
        answer:
          "Contact PetBoxNest within seven calendar days of delivery with your order number, a description, and photos when applicable. We will review confirmed missing, incorrect, or damaged items and provide the appropriate resolution.",
        detailLink: {
          href: "/refund-policy",
          label: "Read the Returns & Refunds Policy.",
        },
      },
      {
        question: "Other shipping issues",
        answer:
          "Weather, carrier disruptions, and other events may affect delivery times. Contact customer care if your shipment needs attention.",
        detailLink: {
          href: "/shipping-policy",
          label: "Read the Shipping Policy.",
        },
      },
    ],
  },
  {
    id: "returns-and-products",
    title: "Returns and products",
    icon: ArrowPath,
    accent: "bg-mint",
    items: [
      {
        question: "What is your return window?",
        answer:
          "Eligible unused, clean, and undamaged items may be returned within 15 calendar days of confirmed delivery.",
        detailLink: {
          href: "/refund-policy",
          label: "Read the Returns & Refunds Policy.",
        },
      },
      {
        question: "How long does a refund take?",
        answer:
          "We initiate approved refunds to the original payment method within five business days after inspection. Your payment provider may need another five to ten business days to post the credit.",
        detailLink: {
          href: "/refund-policy",
          label: "Read the Returns & Refunds Policy.",
        },
      },
      {
        question: "What does the product warranty cover?",
        answer:
          "Our 30-day limited warranty covers qualifying defects in materials or workmanship. Normal wear, impact damage, misuse, and unauthorized alterations are not covered.",
        // detailLink: {
        //   href: "/warranty",
        //   label: "Read the Warranty.",
        // },
      },
    ],
  },
]

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqGroups.flatMap((group) =>
    group.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: [item.answer, item.detailLink?.label].filter(Boolean).join(" "),
      },
    })),
  ),
}

export default function FaqPage() {
  return (
    <main className="overflow-hidden bg-cream text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <header className="border-b border-[#E6E8EC] bg-cream">
        <div className="pbn-container grid gap-10 py-14 small:grid-cols-[minmax(0,1fr)_360px] small:items-end small:py-24 medium:grid-cols-[minmax(0,1fr)_400px] medium:py-28">
          <div>
            <p className="inline-flex min-h-10 items-center gap-2 rounded-full bg-mint px-4 text-xs font-bold uppercase tracking-[0.16em] text-ink">
              <QuestionMarkCircle aria-hidden="true" />
              Help
            </p>
            <h1 className="mt-6 max-w-[820px] text-balance font-display text-[44px] font-bold leading-[1.02] tracking-[-0.05em] xsmall:text-[56px] small:text-[72px] medium:text-[80px]">
              Frequently asked questions
            </h1>
            <p className="mt-6 max-w-[680px] text-lg leading-8 text-muted small:text-xl small:leading-9">
              Start here for quick answers about shopping with PetBoxNest. If
              you still need help, our customer care team is ready.
            </p>

            <nav
              aria-label="FAQ categories"
              className="mt-8 flex flex-wrap gap-3"
            >
              {faqGroups.map((group) => (
                <a
                  key={group.id}
                  href={`#${group.id}`}
                  className="pbn-focus inline-flex min-h-11 items-center rounded-full border border-[#E6E8EC] bg-white px-4 text-sm font-bold text-ink transition-colors hover:border-brand hover:text-brand"
                >
                  {group.title}
                </a>
              ))}
            </nav>
          </div>

          <aside className="rounded-[24px] bg-ink p-6 text-white shadow-[0_16px_40px_rgba(32,36,51,0.12)] xsmall:p-8">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-yellow text-ink">
              <ChatBubbleLeftRight aria-hidden="true" />
            </span>
            <h2 className="mt-6 font-display text-[28px] font-bold leading-tight">
              Need help?
            </h2>
            <p className="mt-3 text-base leading-7 text-white/75">
              Our customer care team can help with orders, products, and policy
              questions.
            </p>
            <LocalizedClientLink
              href="/contact"
              className="pbn-focus mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-white px-6 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:bg-cream motion-reduce:transition-none"
            >
              Contact us <ArrowRight aria-hidden="true" />
            </LocalizedClientLink>
          </aside>
        </div>
      </header>

      <section className="bg-mist py-14 small:py-20 medium:py-24">
        <div className="pbn-container space-y-12 small:space-y-16">
          {faqGroups.map((group) => {
            const Icon = group.icon

            return (
              <section
                key={group.id}
                id={group.id}
                className="scroll-mt-28 rounded-[24px] border border-[#E6E8EC] bg-white p-5 shadow-[0_8px_24px_rgba(32,36,51,0.06)] xsmall:p-8 small:grid small:grid-cols-[260px_minmax(0,1fr)] small:gap-12 small:rounded-[32px] small:p-10 medium:grid-cols-[300px_minmax(0,1fr)] medium:gap-16 medium:p-12"
              >
                <header className="small:self-start">
                  <span
                    className={`grid h-12 w-12 place-items-center rounded-2xl text-ink ${group.accent}`}
                  >
                    <Icon aria-hidden="true" />
                  </span>
                  <h2 className="mt-5 font-display text-[28px] font-bold leading-tight tracking-[-0.03em] small:text-[34px]">
                    {group.title}
                  </h2>
                  <p className="mt-3 text-sm font-bold uppercase tracking-[0.14em] text-brand">
                    {group.items.length} questions
                  </p>
                </header>

                <div className="mt-7 space-y-3 small:mt-0">
                  {group.items.map((item) => (
                    <details
                      key={item.question}
                      className="group rounded-[16px] border border-[#E6E8EC] bg-cream open:border-brand/30 open:bg-white"
                    >
                      <summary className="pbn-focus flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 rounded-[16px] px-4 py-4 text-left text-base font-bold leading-6 text-ink transition-colors hover:text-brand xsmall:px-5 [&::-webkit-details-marker]:hidden">
                        <span>{item.question}</span>
                        <span
                          aria-hidden="true"
                          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mint text-ink transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                        >
                          <ChevronDown />
                        </span>
                      </summary>
                      <div className="space-y-4 px-4 pb-5 pr-16 text-base leading-7 text-muted xsmall:px-5 xsmall:pb-6 xsmall:pr-20">
                        <p>
                          {item.answer}{" "}
                          {item.detailLink && (
                            <LocalizedClientLink
                              href={item.detailLink.href}
                              className="pbn-focus font-bold text-brand underline underline-offset-4"
                            >
                              {item.detailLink.label}
                            </LocalizedClientLink>
                          )}
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </section>

      <section className="bg-cream py-14 small:py-20">
        <div className="pbn-container">
          <div className="grid gap-8 rounded-[24px] bg-brand p-6 text-white shadow-[0_16px_40px_rgba(32,36,51,0.12)] xsmall:p-8 small:grid-cols-[1fr_auto] small:items-center small:rounded-[32px] small:p-12">
            <div className="max-w-[700px]">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-yellow text-ink">
                <ChatBubbleLeftRight aria-hidden="true" />
              </span>
              <h2 className="mt-5 font-display text-[32px] font-bold leading-tight tracking-[-0.035em] small:text-[44px]">
                Still have a question?
              </h2>
              <p className="mt-4 text-base leading-7 text-white/80">
                Send us your order number and the details of what you need.
              </p>
            </div>
            <LocalizedClientLink
              href="/contact"
              className="pbn-focus inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-white px-6 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:bg-cream motion-reduce:transition-none"
            >
              Contact customer care <ArrowRight aria-hidden="true" />
            </LocalizedClientLink>
          </div>
        </div>
      </section>
    </main>
  )
}
