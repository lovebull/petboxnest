import { Metadata } from "next"

import { getBaseURL } from "@lib/util/env"
import CookieConsentBanner from "@modules/layout/components/cookie-consent-banner"
import LayoutSessionBanners from "@modules/layout/components/layout-session-banners"
import { LayoutSessionProvider } from "@modules/layout/components/layout-session-provider"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import { HeaderSkeleton } from "@modules/skeletons/templates/route-skeletons"
import { Suspense } from "react"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function PageLayout(props: { children: React.ReactNode }) {
  return (
    <LayoutSessionProvider>
      <Suspense fallback={<HeaderSkeleton />}>
        <Nav />
      </Suspense>
      <LayoutSessionBanners />
      {props.children}
      <Footer />
      <CookieConsentBanner />
    </LayoutSessionProvider>
  )
}
