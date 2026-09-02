import { ArrowRight } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const supportLinks = [
  { label: "Contact us", href: "/contact" },
  { label: "FAQ", href: "/faq" },
  { label: "Shipping", href: "/shipping-policy" },
  { label: "Refund policy", href: "/refund-policy" },
]

const companyLinks = [
  { label: "Our story", href: "/about-us" },
  { label: "The Nest journal", href: "/articles" },
  { label: "Privacy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms-of-service" },
]

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#E6E8EC] bg-cream text-ink">
      <div className="pbn-container">
        <div className="grid gap-12 py-16 small:grid-cols-[1.15fr_1.85fr] small:gap-20 small:py-20">
          <div>
            <LocalizedClientLink
              href="/"
              className="pbn-focus rounded-lg font-display text-[30px] font-extrabold tracking-[-0.045em] transition-colors hover:text-brand"
            >
              PetBox<span className="text-brand">Nest</span>
            </LocalizedClientLink>
            <p className="mt-5 max-w-[360px] text-base leading-7 text-muted">
              Practical products, happier pets, calmer homes. Made for messy
              paws, cozy naps, and the people who love them.
            </p>
            <a
              href="mailto:support@petboxnest.com"
              className="pbn-focus mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg font-bold text-brand hover:text-brand-dark"
            >
              support@petboxnest.com <ArrowRight aria-hidden="true" />
            </a>
          </div>

          <nav
            aria-label="Footer navigation"
            className="grid grid-cols-2 gap-x-8 gap-y-10 xsmall:grid-cols-3"
          >
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ink">
                Shop
              </h2>
              <ul className="mt-4 space-y-1 text-sm text-muted">
                <li>
                  <LocalizedClientLink
                    href="/store"
                    className="pbn-focus flex min-h-11 items-center rounded-lg hover:text-brand"
                  >
                    Shop all
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/#shop-by-pet"
                    className="pbn-focus flex min-h-11 items-center rounded-lg hover:text-brand"
                  >
                    Shop by pet
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/#best-sellers"
                    className="pbn-focus flex min-h-11 items-center rounded-lg hover:text-brand"
                  >
                    Best sellers
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/#how-it-works"
                    className="pbn-focus flex min-h-11 items-center rounded-lg hover:text-brand"
                  >
                    How it works
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ink">
                Help
              </h2>
              <ul className="mt-4 space-y-1 text-sm text-muted">
                {supportLinks.map((link) => (
                  <li key={link.href}>
                    <LocalizedClientLink
                      href={link.href}
                      className="pbn-focus flex min-h-11 items-center rounded-lg hover:text-brand"
                    >
                      {link.label}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ink">
                PetBoxNest
              </h2>
              <ul className="mt-4 space-y-1 text-sm text-muted">
                {companyLinks.map((link) => (
                  <li key={link.href}>
                    <LocalizedClientLink
                      href={link.href}
                      className="pbn-focus flex min-h-11 items-center rounded-lg hover:text-brand"
                    >
                      {link.label}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        <div className="flex flex-col gap-2 border-t border-[#E6E8EC] py-7 text-xs text-muted xsmall:flex-row xsmall:items-center xsmall:justify-between">
          <p>
            © 2022-{new Date().getFullYear()} PetBoxNest. All rights reserved.
          </p>
          <p>Built for pets. Designed to live with.</p>
        </div>
      </div>
    </footer>
  )
}
