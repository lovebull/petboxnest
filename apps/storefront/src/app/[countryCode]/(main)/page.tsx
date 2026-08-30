import { Metadata } from "next"

import BrandStory from "@modules/home/components/brand-story"
import ClubhouseNotes from "@modules/home/components/clubhouse-notes"
import ContactHero from "@modules/home/components/contact-hero"
import EarlyAccessSignup from "@modules/home/components/early-access-signup"
import Hero from "@modules/home/components/hero"
import JoinTheClub from "@modules/home/components/join-the-club"
import BadmintonDesc from "@modules/home/components/badminton-desc"
import LatestProducts from "@modules/home/components/latest-products"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Larumsport | Badminton and Pickleball Gear",
  description:
    "Shop Larumsport training gear, badminton essentials, pickleball accessories, and everyday court-ready equipment.",
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
      <LatestProducts countryCode={countryCode} region={region} />
      <BadmintonDesc countryCode={countryCode} />
      <JoinTheClub countryCode={countryCode} />
      <BrandStory />
      <ClubhouseNotes />
      <ContactHero />
      <EarlyAccessSignup />
    </>
  )
}
