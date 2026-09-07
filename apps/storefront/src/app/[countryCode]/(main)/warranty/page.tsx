import { createMarketingMetadata } from "@lib/util/seo-metadata"
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
      title="Product warranty"
      intro="Petboxnest products are covered against manufacturing defects for 90 days from the original delivery date, subject to the terms below."
      updated="August 9, 2026"
    >
      <PolicySection title="What is covered">
        <p>
          The limited warranty covers defects in materials or workmanship that
          prevent a product from performing as reasonably intended under normal
          use.
        </p>
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
          Email support@Petboxnest.com with your order number, a description of
          the issue, and clear photos or video showing the product and defect.
          Please keep the product until the claim is resolved.
        </p>
        <p>
          If approved, Petboxnest may repair the product, replace it with the
          same or a comparable item, or issue a refund at our discretion. This
          warranty does not limit rights that cannot be excluded under
          applicable law.
        </p>
      </PolicySection>
    </StaticPageShell>
  )
}
