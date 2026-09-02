import { Metadata } from "next"

import BrandValues from "@modules/home/components/brand-values"
import ClubhouseNotes from "@modules/home/components/clubhouse-notes"
import EarlyAccessSignup from "@modules/home/components/early-access-signup"
import Hero from "@modules/home/components/hero"
import HowItWorks from "@modules/home/components/how-it-works"
import LatestProducts from "@modules/home/components/latest-products"
import ShopByPet from "@modules/home/components/shop-by-pet"
import SocialProof from "@modules/home/components/social-proof"
import TrustStrip from "@modules/home/components/trust-strip"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "PetBoxNest | Better Spaces for Pets and Their People",
  description:
    "Practical litter solutions, cozy resting spots, and everyday pet essentials designed to feel at home in your home.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  return (
    <>
      <Hero />
      <TrustStrip />
      <ShopByPet />
      <LatestProducts countryCode={countryCode} region={region} />
      <BrandValues />
      <HowItWorks />
      <SocialProof />
      <ClubhouseNotes />
      <EarlyAccessSignup />
    </>
  )
}
