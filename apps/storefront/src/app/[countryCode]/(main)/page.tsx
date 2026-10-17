import BrandValues from "@modules/home/components/brand-values"
import CarePerspectives from "@modules/home/components/care-perspectives"
import ClubhouseNotes from "@modules/home/components/clubhouse-notes"
import EarlyAccessSignup from "@modules/home/components/early-access-signup"
import Hero from "@modules/home/components/hero"
import HomeFaq from "@modules/home/components/home-faq"
import HowItWorks from "@modules/home/components/how-it-works"
import LatestProducts from "@modules/home/components/latest-products"
import PetPerspectives from "@modules/home/components/pet-perspectives"
import ShopByPet from "@modules/home/components/shop-by-pet"
import SocialProof from "@modules/home/components/social-proof"
import TrustStrip from "@modules/home/components/trust-strip"
import { getRegion } from "@lib/data/regions"
import { createMarketingMetadata } from "@lib/util/seo-metadata"
import { notFound } from "next/navigation"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params

  return createMarketingMetadata({
    countryCode,
    title: "PetBoxNest | Better Spaces for Pets and Their People",
    description:
      "Practical litter solutions, cozy resting spots, and everyday pet essentials designed to feel at home in your home.",
  })
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  return (
    <>
      <Hero />
      <TrustStrip />
      <ShopByPet />
      <LatestProducts countryCode={countryCode} region={region} />
      <BrandValues />
      <PetPerspectives />
      <HowItWorks />
      <CarePerspectives />
      <SocialProof />
      <HomeFaq />
      <ClubhouseNotes />
      <EarlyAccessSignup />
    </>
  )
}
