import { createPrivateMetadata } from "@lib/util/seo-metadata"

export const metadata = createPrivateMetadata(
  "Order Details | PetBoxNest",
  "Private PetBoxNest order information.",
)

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
