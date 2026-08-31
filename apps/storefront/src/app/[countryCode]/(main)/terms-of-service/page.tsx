import { Metadata } from "next"
import {
  BulletList,
  PolicySection,
  StaticPageShell,
} from "@modules/content/components/static-page-shell"

export const metadata: Metadata = {
  title: "Terms of Service | Petboxnest",
  description:
    "Read the terms governing use of the Petboxnest website, product purchases, payments, shipping, returns, and account activity.",
}

export default function TermsOfServicePage() {
  return (
    <StaticPageShell
      eyebrow="Legal"
      title="Terms of service"
      intro="These terms govern your use of the Petboxnest storefront and purchases made directly from us. By using the site, you agree to these terms."
      updated="August 9, 2026"
    >
      <PolicySection title="1. Store use and eligibility">
        <p>
          You may use the storefront only for lawful personal shopping. You
          must provide current and accurate information and be legally capable
          of entering into a binding agreement in your jurisdiction.
        </p>
      </PolicySection>

      <PolicySection title="2. Products, prices, and availability">
        <p>
          We work to present product descriptions, images, prices, and
          availability accurately. Colors and details may appear differently
          depending on your device. We may correct errors, update information,
          limit quantities, or discontinue products without prior notice.
        </p>
      </PolicySection>

      <PolicySection title="3. Orders and payment">
        <p>
          An order confirmation acknowledges that we received your order; it
          does not guarantee acceptance. We may refuse or cancel an order for
          suspected fraud, payment failure, pricing error, inventory shortage,
          resale activity, or other legitimate reasons. If payment was captured
          for a canceled order, it will be refunded.
        </p>
        <p>
          You authorize us and our payment providers to charge the payment
          method selected at checkout, including applicable taxes and shipping.
        </p>
      </PolicySection>

      <PolicySection title="4. Shipping, returns, and warranty">
        <p>
          Delivery estimates are not guaranteed and may be affected by carriers
          or events outside our reasonable control. Our Shipping Policy, Refund
          Policy, and Warranty form part of these terms.
        </p>
      </PolicySection>

      <PolicySection title="5. Accounts and prohibited conduct">
        <p>You are responsible for activity under your account and must not:</p>
        <BulletList>
          <li>Use the storefront for unlawful, fraudulent, or abusive activity.</li>
          <li>Attempt to access accounts, data, or systems without authorization.</li>
          <li>Interfere with storefront security, availability, or operation.</li>
          <li>Copy, scrape, resell, or exploit site content without permission.</li>
          <li>Upload malicious code or infringe another person's rights.</li>
        </BulletList>
      </PolicySection>

      <PolicySection title="6. Intellectual property">
        <p>
          The Petboxnest name, site design, text, graphics, product imagery, and
          other original content are owned by or licensed to Petboxnest and are
          protected by applicable intellectual-property laws. Personal,
          noncommercial viewing is permitted; no other license is granted.
        </p>
      </PolicySection>

      <PolicySection title="7. Disclaimers and liability">
        <p>
          To the extent permitted by law, the storefront is provided “as is”
          and “as available.” We do not guarantee uninterrupted or error-free
          operation. Petboxnest will not be liable for indirect, incidental,
          special, or consequential losses arising from use of the storefront
          or products where such limitations are legally permitted.
        </p>
        <p>
          Nothing in these terms excludes warranties, remedies, or liability
          that cannot legally be excluded or limited.
        </p>
      </PolicySection>

      <PolicySection title="8. Governing law and changes">
        <p>
          These terms are governed by applicable U.S. federal and state laws,
          without regard to conflict-of-law principles. We may update the terms
          by posting a revised version and changing the date above. Continued
          use after an update constitutes acceptance where permitted by law.
        </p>
        <p>Questions about these terms may be sent to support@Petboxnest.com.</p>
      </PolicySection>
    </StaticPageShell>
  )
}
