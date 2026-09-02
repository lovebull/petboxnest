import { Metadata } from "next"
import type { ReactNode } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  ArrowRight,
  ChatBubbleLeftRight,
  Clock,
  MapPin,
  TruckFast,
} from "@medusajs/icons"

export const metadata: Metadata = {
  title: "Shipping Policy | Petboxnest",
  description:
    "Review Petboxnest order processing, U.S. shipping methods, estimated delivery times, tracking, and lost package information.",
}

const policyLinks = [
  { id: "processing-and-delivery", label: "Processing and delivery" },
  { id: "shipping-costs", label: "Shipping Costs" },
  { id: "shipping-carriers", label: "Shipping Carriers" },
  { id: "lost-or-damaged-packages", label: "Lost or Damaged Packages" },
  {
    id: "incorrect-shipping-information",
    label: "Incorrect Shipping Information",
  },
  { id: "tracking-your-order", label: "Tracking your order" },
  {
    id: "address-changes-and-delivery-issues",
    label: "Address changes and delivery issues",
  },
  { id: "shipping-area", label: "Shipping area" },
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

export default function ShippingPolicyPage() {
  return (
    <main className="overflow-x-clip bg-cream text-ink">
      <header className="relative overflow-hidden border-b border-[#E6E8EC] bg-cream">
        <div
          aria-hidden="true"
          className="absolute -right-24 top-14 h-64 w-64 rounded-full bg-yellow/60 small:right-8 small:h-80 small:w-80"
        />
        <div
          aria-hidden="true"
          className="absolute -left-24 bottom-[-120px] h-64 w-64 rounded-full bg-mint/70"
        />

        <div className="pbn-container relative grid gap-10 py-14 small:grid-cols-[minmax(0,1fr)_360px] small:items-end small:py-24 medium:grid-cols-[minmax(0,1fr)_400px] medium:py-28">
          <div>
            <p className="inline-flex min-h-10 items-center gap-2 rounded-full bg-mint px-4 text-xs font-bold uppercase tracking-[0.16em] text-ink">
              <TruckFast aria-hidden="true" />
              Help
            </p>
            <h1 className="mt-6 max-w-[820px] text-balance font-display text-[44px] font-bold leading-[1.02] tracking-[-0.05em] xsmall:text-[56px] small:text-[72px] medium:text-[80px]">
              Shipping policy
            </h1>
            <p className="mt-6 max-w-[680px] text-lg leading-8 text-muted small:text-xl small:leading-9">
              Clear delivery expectations from checkout to your door.
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
              The delivery estimate shown at checkout is the most current
              estimate for your order.
            </p>
          </aside>
        </div>
      </header>

      <div className="bg-mist py-14 small:py-20 medium:py-24">
        <div className="pbn-container grid min-w-0 gap-8 small:grid-cols-[280px_minmax(0,1fr)] small:items-start small:gap-10 medium:gap-14">
          <aside className="min-w-0 space-y-5 small:sticky small:top-28">
            <nav
              aria-label="Shipping policy sections"
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
                      className="pbn-focus group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold leading-5 text-muted transition-colors hover:bg-cream hover:text-brand"
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
              id="processing-and-delivery"
              title="Processing and delivery"
              index={0}
            >
              <p>
                Orders are generally processed within one to two business days.
                Orders placed on weekends or U.S. holidays begin processing on
                the next business day.
              </p>
              <div
                className="max-w-full overflow-x-auto rounded-[16px] border border-[#E6E8EC] bg-cream"
                tabIndex={0}
                role="region"
                aria-label="Shipping methods and estimated delivery times"
              >
                <table className="w-full min-w-[600px] border-collapse text-left text-sm text-ink">
                  <thead className="bg-mint">
                    <tr>
                      <th scope="col" className="px-5 py-4 font-bold">
                        Method
                      </th>
                      <th scope="col" className="px-5 py-4 font-bold">
                        Cost
                      </th>
                      <th scope="col" className="px-5 py-4 font-bold">
                        Estimated delivery
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E8EC]">
                    <tr>
                      <td className="px-5 py-4 font-bold">Standard</td>
                      <td className="px-5 py-4">Calculated at checkout</td>
                      <td className="px-5 py-4">3-7 business days</td>
                    </tr>
                    <tr>
                      <td className="px-5 py-4 font-bold">Express</td>
                      <td className="px-5 py-4">Calculated at checkout</td>
                      <td className="px-5 py-4">2-3 business days</td>
                    </tr>
                    <tr>
                      <td className="px-5 py-4 font-bold">
                        Free standard shipping
                      </td>
                      <td className="px-5 py-4">Orders of $100 or more</td>
                      <td className="px-5 py-4">3-7 business days</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </PolicyCard>

            <PolicyCard id="shipping-costs" title="Shipping Costs" index={1}>
              <p>
                We offer the following shipping rates for orders placed on
                Petboxnest:
              </p>
              <ul className="list-disc space-y-2 pl-5 marker:text-brand">
                <li>Free Shipping for orders totaling over $100.</li>
                <li>
                  A flat rate of $9.99 for orders totaling less than $100.
                </li>
                <li>International Shipping we charge Flat Rate of $20.</li>
              </ul>
            </PolicyCard>

            <PolicyCard
              id="shipping-carriers"
              title="Shipping Carriers"
              index={2}
            >
              <p>
                Petboxnest partners with reliable carriers to ensure your order
                arrives safely and on time. We primarily use FedEx, UPS, and
                USPS for all shipments.
              </p>
            </PolicyCard>

            <PolicyCard
              id="lost-or-damaged-packages"
              title="Lost or Damaged Packages"
              index={3}
            >
              <p>
                Petboxnest is not liable for any products damaged or lost during
                shipping. If you received your order damaged, please contact the
                shipment carrier to file a claim. Please save all packaging
                materials and damaged goods before filing a claim.
              </p>
            </PolicyCard>

            <PolicyCard
              id="incorrect-shipping-information"
              title="Incorrect Shipping Information"
              index={4}
            >
              <p>
                It is the responsibility of the customer to ensure that the
                shipping address provided is accurate and complete.Petboxnest is
                not responsible for orders delivered to incorrect addresses
                supplied by the customer. If an order is returned to us due to
                an incorrect address, the customer will be responsible for the
                re-shipping costs.
              </p>
            </PolicyCard>

            <PolicyCard
              id="tracking-your-order"
              title="Tracking your order"
              index={5}
            >
              <p>
                When your order ships, we send a confirmation email with
                tracking information. Tracking may take up to 24 hours to show
                movement after the carrier receives the package.
              </p>
            </PolicyCard>

            <PolicyCard
              id="address-changes-and-delivery-issues"
              title="Address changes and delivery issues"
              index={6}
            >
              <ul className="list-disc space-y-2 pl-5 marker:text-brand">
                <li>
                  Contact us as soon as possible if your shipping address is
                  incorrect.
                </li>
                <li>
                  Once a package has shipped, address changes are not
                  guaranteed.
                </li>
                <li>
                  If tracking shows delivered but the package is missing, check
                  with household members and neighbors before contacting us.
                </li>
                <li>
                  Report damaged or lost packages promptly so we can review the
                  shipment with the carrier.
                </li>
              </ul>
            </PolicyCard>

            <PolicyCard id="shipping-area" title="Shipping area" index={7}>
              <div className="flex items-start gap-3">
                <MapPin
                  aria-hidden="true"
                  className="mt-1 shrink-0 text-brand"
                />
                <p>
                  This policy applies to orders shipped within the United
                  States. Availability, rates, and delivery times may vary for
                  Alaska, Hawaii, U.S. territories, PO boxes, and military
                  addresses.
                </p>
              </div>
            </PolicyCard>
          </article>
        </div>
      </div>
    </main>
  )
}
