import { Metadata } from "next"
import {
  BulletList,
  PolicySection,
  StaticPageShell,
} from "@modules/content/components/static-page-shell"

export const metadata: Metadata = {
  title: "Refund Policy | Petboxnest",
  description:
    "Learn about Petboxnest's 30-day return window, item eligibility, return process, exchanges, and refund timing.",
}

export default function RefundPolicyPage() {
  return (
    <StaticPageShell
      eyebrow="Help"
      title="Returns and refunds"
      intro="We want every Petboxnest product to feel right. "
      updated="August 9, 2026"
    >
      {/* Eligible items may be returned within 30 days of delivery. */}

      <PolicySection title="Return eligibility">
        <BulletList>

          <li>All Sales Are Final: Once an order is placed, it cannot be cancelled, returned, or exchanged. We encourage our customers to review their selections carefully before finalizing their purchase.</li>

          <li>No Refunds or Exchanges: We do not offer refunds or exchanges on any products purchased from our store. Please ensure you have selected the correct items and quantities before completing your order.</li>
          <li>Product Concerns: If you believe you have received a defective or incorrect item, please contact our customer service team immediately at support@Petboxnest.com. We will do our best to address and resolve any issues.</li>
          <li>Order Discrepancies: If there are any discrepancies with your order, such as missing or incorrect items, please notify us within 48 hours of receiving your package. We will investigate the matter and provide appropriate solutions.</li>
          <li>Understanding Our Policy: We understand that every situation is unique. Our policy is in place to ensure the integrity and quality of our products. We encourage all customers to reach out with any questions or concerns before placing an order.</li>
          {/* <li>Start your return within 30 days of confirmed delivery.</li>
          <li>Items must be unused, unworn, unwashed, and in original condition.</li>
          <li>Original tags, accessories, and packaging must be included.</li>
          <li>Proof of purchase from Petboxnest is required.</li> */}
        </BulletList>
        {/* <p>
          Final-sale items, gift cards, personalized products, and items marked
          non-returnable at purchase are not eligible unless they arrive
          damaged or defective.
        </p> */}
      </PolicySection>

      {/* <PolicySection title="How to make a return">
        <ol className="space-y-5">
          <li><strong className="text-ui-fg-base">1. Contact us.</strong> Email support@Petboxnest.com with your order number and the item you want to return.</li>
          <li><strong className="text-ui-fg-base">2. Receive instructions.</strong> We will confirm eligibility and provide the return address and shipping instructions.</li>
          <li><strong className="text-ui-fg-base">3. Pack securely.</strong> Include the item, original packaging, and all accessories.</li>
          <li><strong className="text-ui-fg-base">4. Send the return.</strong> Keep your carrier receipt and tracking number until the return is completed.</li>
        </ol>
      </PolicySection> */}

      {/* <PolicySection title="Refund timing">
        <p>
          We inspect returns after arrival. Approved refunds are sent to the
          original payment method, usually within five business days after
          inspection. Your financial institution may need an additional five
          to ten business days to post the credit.
        </p>
        <p>
          Original shipping charges are not refundable. Return shipping may be
          deducted from the refund unless the item was damaged, defective, or
          incorrect when delivered.
        </p>
      </PolicySection> */}

      <PolicySection title="Amazon purchases">
        <p>
           Products purchased through Amazon must be returned through
          Amazon and follow the return policy shown on that order.
        </p>
      </PolicySection>


        <PolicySection title="   ">
        <p>
          By making a purchase on Petboxnest, you acknowledge and agree to our return policy. We thank you for your understanding and look forward to serving your badminton needs.
        </p>
      </PolicySection>
    </StaticPageShell>
  )
}
