import type { Metadata } from "next"
import GuestAfterSales from "@modules/order/components/guest-after-sales"

export const metadata: Metadata = {
  title: "Guest Returns",
  description:
    "Securely request a PetBoxNest return without creating an account.",
  robots: { index: false, follow: false },
}

export default function GuestReturnsPage() {
  return <GuestAfterSales />
}
