import { createMarketingMetadata } from "@lib/util/seo-metadata"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  BulletList,
  PolicySection,
  StaticPageShell,
} from "@modules/content/components/static-page-shell"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  return createMarketingMetadata({
    countryCode: (await params).countryCode,
    path: "warranty",
    title: "Warranty | PetBoxNest",
    description:
      "Review PetBoxNest's limited product warranty, coverage, exclusions, and how to submit a warranty claim.",
  })
}

export default function WarrantyPage() {
  return (
    <StaticPageShell
      eyebrow="Help"
      title="30-day limited warranty"
      intro="PetBoxNest products are covered only for qualifying manufacturing defects in materials or workmanship for 30 days from the original delivery date, subject to the terms below."
      updated="September 11, 2026"
    >
      <PolicySection title="Warranty coverage">
        <p>
          This 30-day limited warranty applies only to qualifying manufacturing
          defects in materials or workmanship that prevent a product from
          performing as reasonably intended under normal use. Coverage begins on
          the original delivery date and requires proof of purchase.
        </p>
        <p>
          It does not cover a change of mind, fit or preference, or damage that
          occurs after delivery for reasons unrelated to a manufacturing defect.
        </p>
      </PolicySection>

      <PolicySection title="Warranty and returns are different">
        <p>
          The ordinary return policy applies to eligible unused, clean, and
          undamaged items returned within 15 calendar days of confirmed
          delivery. The 30-day limited warranty applies only to qualifying
          manufacturing defects and may still be available after the ordinary
          return window has ended.
        </p>
        <LocalizedClientLink
          href="/refund-policy"
          className="pbn-focus inline-flex min-h-11 items-center font-bold text-brand underline underline-offset-4"
        >
          Read the Returns &amp; Refunds Policy
        </LocalizedClientLink>
      </PolicySection>

      <PolicySection title="What is not covered">
        <BulletList>
          <li>Normal wear, cosmetic changes, scratches, or fading.</li>
          <li>
            Damage caused by impact, misuse, neglect, or improper storage.
          </li>
          <li>
            Unauthorized repair, alteration, or use outside the product's
            intended purpose.
          </li>
          <li>
            Items purchased from an unauthorized seller or without proof of
            purchase.
          </li>
          <li>Consumable parts that naturally wear during regular play.</li>
        </BulletList>
      </PolicySection>

      <PolicySection title="Submit a claim">
        <p>
          Email support@petboxnest.com with your order number, a description of
          the issue, and clear photos or video showing the product and defect.
          Please keep the product until the claim is resolved.
        </p>
      </PolicySection>

      <PolicySection title="Available remedies">
        <p>
          If approved, PetBoxNest may repair the product, replace it with the
          same or a comparable item, or issue a refund at our discretion. This
          remedy is separate from the ordinary 15-day return process.
        </p>
        <p>
          This limited warranty does not exclude or reduce consumer rights or
          remedies that cannot legally be excluded or limited.
        </p>
      </PolicySection>
    </StaticPageShell>
  )
}
