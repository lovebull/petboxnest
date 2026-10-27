import type { Metadata } from "next"
import GuestAfterSales from "@modules/order/components/guest-after-sales"

export const metadata: Metadata = {
  title: "Track Order | PetBoxNest",
  description: "Verify your checkout email to view your PetBoxNest order status and shipment tracking. No account required.",
  robots: { index: false, follow: false },
}

export default function TrackOrderPage() {
  return <GuestAfterSales mode="tracking" />
}
