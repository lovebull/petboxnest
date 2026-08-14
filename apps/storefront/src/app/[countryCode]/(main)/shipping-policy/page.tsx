import { Metadata } from "next"
import {
  BulletList,
  PolicySection,
  StaticPageShell,
} from "@modules/content/components/static-page-shell"

export const metadata: Metadata = {
  title: "Shipping Policy | Larumsport",
  description:
    "Review Larumsport order processing, U.S. shipping methods, estimated delivery times, tracking, and lost package information.",
}

export default function ShippingPolicyPage() {
  return (
    <StaticPageShell
      eyebrow="Help"
      title="Shipping policy"
      intro="Clear delivery expectations from checkout to your door. The delivery estimate shown at checkout is the most current estimate for your order."
      updated="August 9, 2026"
    >
      <PolicySection title="Processing and delivery">
        <p>
          Orders are generally processed within one to two business days.
          Orders placed on weekends or U.S. holidays begin processing on the
          next business day.
        </p>
        <div className="overflow-x-auto border border-[#ded8c8]">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead className="bg-[#eee8d9] text-ui-fg-base">
              <tr>
                <th scope="col" className="px-5 py-4 font-semibold">Method</th>
                <th scope="col" className="px-5 py-4 font-semibold">Cost</th>
                <th scope="col" className="px-5 py-4 font-semibold">Estimated delivery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8c8]">
              <tr>
                <td className="px-5 py-4">Standard</td>
                <td className="px-5 py-4">Calculated at checkout</td>
                <td className="px-5 py-4">3-7 business days</td>
              </tr>
              <tr>
                <td className="px-5 py-4">Express</td>
                <td className="px-5 py-4">Calculated at checkout</td>
                <td className="px-5 py-4">2-3 business days</td>
              </tr>
              <tr>
                <td className="px-5 py-4">Free standard shipping</td>
                <td className="px-5 py-4">Orders of $100 or more</td>
                <td className="px-5 py-4">3-7 business days</td>
              </tr>
            </tbody>
          </table>
        </div>
      </PolicySection>

      <PolicySection title="Shipping Costs">
        <p>
         We offer the following shipping rates for orders placed on LarumSport:
        </p>
        <li>Free Shipping for orders totaling over $100.</li>
        <li>A flat rate of $9.99 for orders totaling less than $100.</li>
        <li>International Shipping we charge Flat Rate of $20.</li>
      </PolicySection>

      <PolicySection title="Shipping Carriers">
        <p>
        LarumSport partners with reliable carriers to ensure your order arrives safely and on time. We primarily use FedEx, UPS, and USPS for all shipments.
        </p>
      </PolicySection>


      <PolicySection title="Lost or Damaged Packages">
        <p>
        LarumSport is not liable for any products damaged or lost during shipping. If you received your order damaged, please contact the shipment carrier to file a claim. Please save all packaging materials and damaged goods before filing a claim.
        </p>

      </PolicySection>


      <PolicySection title="Incorrect Shipping Information">
        <p>
        It is the responsibility of the customer to ensure that the shipping address provided is accurate and complete.LarumSport is not responsible for orders delivered to incorrect addresses supplied by the customer. If an order is returned to us due to an incorrect address, the customer will be responsible for the re-shipping costs.
        </p>

      </PolicySection>



      <PolicySection title="Tracking your order">
        <p>
          When your order ships, we send a confirmation email with tracking
          information. Tracking may take up to 24 hours to show movement after
          the carrier receives the package.
        </p>
      </PolicySection>

      <PolicySection title="Address changes and delivery issues">
        <BulletList>
          <li>Contact us as soon as possible if your shipping address is incorrect.</li>
          <li>Once a package has shipped, address changes are not guaranteed.</li>
          <li>
            If tracking shows delivered but the package is missing, check with
            household members and neighbors before contacting us.
          </li>
          <li>
            Report damaged or lost packages promptly so we can review the
            shipment with the carrier.
          </li>
        </BulletList>
      </PolicySection>

      <PolicySection title="Shipping area">
        <p>
          This policy applies to orders shipped within the United States.
          Availability, rates, and delivery times may vary for Alaska, Hawaii,
          U.S. territories, PO boxes, and military addresses.
        </p>
      </PolicySection>
    </StaticPageShell>
  )
}
