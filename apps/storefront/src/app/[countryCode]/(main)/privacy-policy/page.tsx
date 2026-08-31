import { Metadata } from "next"
import {
  BulletList,
  PolicySection,
  StaticPageShell,
} from "@modules/content/components/static-page-shell"

export const metadata: Metadata = {
  title: "Privacy Policy | Petboxnest",
  description:
    "Understand what personal information Petboxnest collects, how it is used and shared, and the privacy choices available to U.S. customers.",
}

export default function PrivacyPolicyPage() {
  return (
    <StaticPageShell
      eyebrow="Legal"
      title="Privacy policy"
      intro="This policy explains how Petboxnest collects, uses, discloses, and protects personal information when you visit our storefront or purchase from us."
      updated="August 9, 2026"
    >
      <PolicySection title="Information we collect">
        <BulletList>
          <li>
            Contact and account details, including your name, email, telephone
            number, billing address, and shipping address.
          </li>
          <li>
            Order and transaction details. Payment card information is
            processed by our payment providers and is not stored in full by us.
          </li>
          <li>
            Device, browser, IP address, cookie, and storefront interaction
            data collected when you use the site.
          </li>
          <li>
            Communications you send to customer care, including return and
            warranty requests.
          </li>
        </BulletList>
      </PolicySection>

      <PolicySection title="How we use information">
        <p>We use personal information to:</p>
        <BulletList>
          <li>Process orders, payments, delivery, returns, and refunds.</li>
          <li>Provide account features and customer support.</li>
          <li>Prevent fraud, secure the storefront, and comply with law.</li>
          <li>Improve products, site performance, and the shopping experience.</li>
          <li>
            Send marketing communications where permitted. You may unsubscribe
            at any time using the link in those messages.
          </li>
        </BulletList>
      </PolicySection>

      <PolicySection title="How information is shared">
        <p>
          We share information only as reasonably necessary with service
          providers that support payment processing, fraud prevention,
          analytics, order fulfillment, delivery, email, and hosting. We may
          also disclose information when required by law, to protect rights and
          safety, or as part of a business transfer.
        </p>
        <p>
          We do not sell personal information for money. Some analytics or
          advertising activity may be considered sharing under certain U.S.
          state privacy laws, where applicable.
        </p>
      </PolicySection>

      <PolicySection title="Cookies and choices">
        <p>
          Cookies help keep the cart working, remember preferences, understand
          site performance, and measure marketing. Browser settings can block
          or delete cookies, although essential storefront features may then
          stop working correctly.
        </p>
      </PolicySection>

      <PolicySection title="Your privacy rights">
        <p>
          Depending on where you live, you may have the right to request access,
          correction, deletion, or a copy of personal information, and to opt
          out of certain uses or sharing. We will verify requests as required
          and will not discriminate against you for exercising applicable
          rights.
        </p>
        <p>
          Submit a request to support@Petboxnest.com with the subject “Privacy
          Request.” An authorized agent may submit a request where permitted by
          law.
        </p>
      </PolicySection>

      <PolicySection title="Retention, security, and children">
        <p>
          We retain information only as long as reasonably needed for the
          purposes described here, including legal, tax, fraud-prevention, and
          dispute requirements. We use reasonable administrative and technical
          safeguards, but no internet transmission is completely secure.
        </p>
        <p>
          The storefront is not directed to children under 13, and we do not
          knowingly collect their personal information.
        </p>
      </PolicySection>

      <PolicySection title="Policy changes and contact">
        <p>
          We may update this policy to reflect operational, legal, or technical
          changes. The date at the top shows the latest revision. Questions may
          be sent to support@Petboxnest.com.
        </p>
      </PolicySection>
    </StaticPageShell>
  )
}
