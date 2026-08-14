import { Metadata } from "next"
import {
  BulletList,
  PolicySection,
  StaticPageShell,
} from "@modules/content/components/static-page-shell"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "About Us | Larumsport",
  description:
    "Meet Larumsport and learn why we create considered equipment and everyday essentials for life on and beyond the court.",
}

export default function AboutUsPage() {
  return (
    <StaticPageShell
      eyebrow="About Larumsport"
      title="Made for the way you play."
      intro="Larumsport creates approachable sports essentials for people who care about movement, good design, and the community built around a game."
    >
      <PolicySection title="Our story" id="our-story">
        <p>
          Larumsport began with a simple idea: the best days on court rarely
          end when the final point is played. The ritual before a match, the
          conversation afterward, and the people who return each week matter
          just as much.
        </p>
        <p>
          We focus on badminton, {/*pickleball, and versatile*/} accessories that
          fit naturally into an active day. Every product is selected with
          usefulness, durability, and a clean point of view in mind.
        </p>
      </PolicySection>

      <PolicySection title="What guides us">
        <BulletList>
          <li>
            <strong className="text-ui-fg-base">Play often.</strong> Products
            should make it easier to get on court and stay in motion.
          </li>
          <li>
            <strong className="text-ui-fg-base">Choose with purpose.</strong>{" "}
            We favor useful details and lasting function over unnecessary
            complexity.
          </li>
          <li>
            <strong className="text-ui-fg-base">Welcome everyone.</strong> The
            best sports communities make room for beginners and regulars
            alike.
          </li>
        </BulletList>
      </PolicySection>

      <PolicySection title="Find your next game">
        <p>
          Explore equipment and accessories designed to move easily between
          practice, competition, and everyday life.
        </p>
        <LocalizedClientLink
          href="/store"
          className="inline-flex min-h-12 items-center justify-center bg-[#242321] px-8 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#47443f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          Shop all products
        </LocalizedClientLink>
      </PolicySection>
    </StaticPageShell>
  )
}
