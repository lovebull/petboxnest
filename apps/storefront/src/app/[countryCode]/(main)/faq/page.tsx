import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { StaticPageShell } from "@modules/content/components/static-page-shell"

export const metadata: Metadata = {
  title: "FAQ | Petboxnest",
  description:
    "Find answers about Petboxnest orders, payments, shipping, returns, product availability, warranties, and Amazon purchases.",
}

const faqGroups = [
  {
    title: "Orders and payment",
    items: [
      {
        question: "How do I know my order was received?",
        answer:
          "After checkout, you will see an order confirmation and receive a confirmation email. Check your spam folder and contact us if the email does not arrive within an hour.",
      },
      {
        question: "Can I change or cancel an order?",
        answer:
          "Contact us as soon as possible. We can try to update an order before fulfillment begins, but changes and cancellations are not guaranteed after processing starts.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "Available payment methods are displayed securely at checkout and may vary by device or order. We do not store complete payment card details on the storefront.",
      },
      {

        question:"Can I change the shipping address on my order?",
        answer:"If you notice that your shipping address is incorrect, please log in to your account to cancel your order before it has been fulfilled. If your order has already been fulfilled, it may be too late to cancel the order, but please reach out to support@Petboxnest.com for assistance."
      },
    ],
  },
  {
    title: "Shipping and delivery",
    items: [
      {
        question: "When will my order ship?",
        answer:

          "We are a small but mighty team, and orders typically take 2 business days to process before they are shipped. During peak seasons or promotional periods, order processing times may be extended. You’ll get a shipment notification email with a tracking number as soon as your package ships.\n\nMost orders are processed within one to two business days. You will receive tracking information when the carrier accepts the shipment.",
      },
      {
        question: "Do you offer free shipping?",
        answer:
          "Standard shipping is free on qualifying U.S. orders of $100 or more. The checkout page shows the current shipping options and final cost.",
      },
      {
        question: "What should I do if tracking says delivered?",
        answer:
          "Check the delivery area, household members, neighbors, and any carrier notice. If the package remains missing, contact us with your order number and tracking details.",
      },
      {
        question: "My order was lost, stolen, or damaged. Can you help? ",
        answer:
          "Occasionally a carrier will mark a package as delivered early, so we recommend keeping an eye out for your order for the next 48 hours. We also suggest checking all surrounding areas and/or entrances to your home to check that your package is not hiding or jammed, and asking your neighbors if they may have received it for you by mistake.If your package is lost or stolen after being marked as delivered or is damaged during transit, Petboxnest offers a replacement order free of charge or your original order value in store credit. Please email support@Petboxnest.com to start the process. ",
      },
      {
        question:"Other shipping issues",
        answer:"While we strive to ensure smooth and timely delivery, unforeseen circumstances such as weather conditions, natural disasters, or shipping carrier delays may affect delivery times. Please email us at support@Petboxnest.com for any other delivery questions, issues, or concerns."
      },
    ],
  },
  {
    title: "Returns and products",
    items: [
      {
        question: "What is your return window?",
        answer:
          "Eligible unused and unworn items may be returned within 30 days of confirmed delivery. Original tags, accessories, packaging, and proof of purchase are required.",
      },
      {
        question: "How long does a refund take?",
        answer:
          "Approved returns are generally refunded within five business days after inspection. Your financial institution may need another five to ten business days to post the credit.",
      },
      {
        question: "What does the product warranty cover?",
        answer:
          "Our 90-day limited warranty covers qualifying defects in materials or workmanship. Normal wear, impact damage, misuse, and unauthorized alterations are not covered.",
      },
      {
        question: "What if I purchased through Amazon?",
        answer:
          "Orders completed on Amazon are managed under the order, delivery, and return options shown in your Amazon account. Contact Amazon support for marketplace order changes or returns.",
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
        text: item.answer,
      },
    }))
  ),
}

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <StaticPageShell
        eyebrow="Help"
        title="Frequently asked questions"
        intro="Start here for quick answers about shopping with Petboxnest. If you still need help, our customer care team is ready."
      >
        {faqGroups.map((group) => (
          <section key={group.title} className="border-t border-[#ded8c8] pt-8 first:border-t-0 first:pt-0">
            <h2 className="font-serif text-[30px] font-normal leading-tight tracking-[-0.02em] text-ui-fg-base small:text-[36px]">
              {group.title}
            </h2>
            <div className="mt-5 divide-y divide-[#ded8c8] border-y border-[#ded8c8]">
              {group.items.map((item) => (
                <details key={item.question} className="group">
                  <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-4 text-left font-medium text-ui-fg-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden">
                    <span>{item.question}</span>
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-2xl font-light transition-transform duration-200 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <div className="max-w-2xl space-y-4 pb-6 pr-10 text-sm leading-7 small:text-base">
                    {item.answer.split("\n\n").map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}

        <section className="border-t border-[#ded8c8] pt-8">
          <h2 className="font-serif text-[30px] font-normal leading-tight tracking-[-0.02em] text-ui-fg-base">
            Still have a question?
          </h2>
          <p className="mt-4">Send us your order number and the details of what you need.</p>
          <LocalizedClientLink
            href="/contact"
            className="mt-5 inline-flex min-h-12 items-center justify-center bg-[#242321] px-8 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#47443f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Contact customer care
          </LocalizedClientLink>
        </section>
      </StaticPageShell>
    </>
  )
}
