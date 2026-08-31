import { Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MedusaCTA from "@modules/layout/components/medusa-cta"

const footerMenus = [
  {
    title: "SHOP",
    links: [
      { label: "Shop All", href: "/store" },
      { label: "Badminton", href: "/categories/badminton" },
      // { label: "Pickleball", href: "/categories/pickleball" },
      // { label: "Accessories", href: "/categories/accessories" },
    ],
  },
  {
    title: "HELP",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Shipping", href: "/shipping-policy" },
      // { label: "Warranty", href: "/warranty" },
    ],
  },
  {
    title: "ABOUT",
    links: [
      { label: "About Us", href: "/about-us" },
      { label: "Our Story", href: "/about-us#our-story" },
    ],
  },
  {
    title: "LEGAL",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "Refund Policy", href: "/refund-policy" },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#ded8c8] bg-[#f7f3e7]">
      <div className="content-container flex w-full flex-col">
        <div className="grid gap-14 py-16 small:grid-cols-[minmax(220px,1.15fr)_minmax(0,2fr)] small:gap-20 small:py-24">
          <div>
            <LocalizedClientLink
              href="/"
              className="font-serif text-[30px] font-normal uppercase tracking-[-0.02em] text-ui-fg-base transition-opacity hover:opacity-60"
            >
              Petboxnest
            </LocalizedClientLink>
            <p className="mt-5 max-w-[300px] text-sm leading-6 text-ui-fg-subtle">
              Equipment and everyday essentials made for play, movement, and
              the moments beyond the court.
            </p>
            <a
              href="mailto:support@petboxnest.com"
              className="mt-5 inline-block border-b border-ui-fg-base pb-0.5 text-sm text-ui-fg-base transition-opacity hover:opacity-60"
            >
              support@petboxnest.com
            </a>
          </div>

          <nav
            aria-label="Footer navigation"
            className="grid grid-cols-2 gap-x-8 gap-y-12 xsmall:grid-cols-4"
          >
            {footerMenus.map((menu) => (
              <div key={menu.title}>
                <h2 className="text-xs font-semibold tracking-[0.16em] text-ui-fg-base">
                  {menu.title}
                </h2>
                <ul className="mt-5 space-y-1 text-sm text-ui-fg-subtle">
                  {menu.links.map((link) => (
                    <li key={`${menu.title}-${link.href}`}>
                      <LocalizedClientLink
                        href={link.href}
                        className="flex min-h-11 items-center transition-colors hover:text-ui-fg-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                      >
                        {link.label}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="border-t border-[#ded8c8] pt-6 pb-12">
          <ul
            className="mb-5 flex flex-wrap items-center gap-3"
            aria-label="Accepted payment methods"
          >
            <li className="grid h-7 min-w-12 place-items-center rounded-sm bg-[#172274] px-3 text-[11px] font-semibold tracking-wide text-white">
              VISA
            </li>
            <li className="flex h-7 min-w-12 items-center justify-center rounded-sm bg-[#121826] px-3" aria-label="Mastercard">
              <span className="h-4 w-4 rounded-full bg-[#eb001b]" />
              <span className="-ml-1.5 h-4 w-4 rounded-full bg-[#f79e1b] mix-blend-screen" />
            </li>
            <li className="grid h-7 min-w-12 place-items-center rounded-sm bg-[#003087] px-3 text-[11px] font-semibold text-white">
              PayPal
            </li>
            <li className="grid h-7 min-w-12 place-items-center rounded-sm bg-black px-3 text-[11px] font-semibold text-white">
              Apple Pay
            </li>
            <li className="grid h-7 min-w-12 place-items-center rounded-sm bg-[#ffb3c7] px-3 text-[11px] font-semibold text-[#17120f]">
              Klarna.
            </li>
            <li className="grid h-7 min-w-12 place-items-center rounded-sm bg-[#006fcf] px-3 text-[9px] font-semibold leading-none text-white">
              AMERICAN
              <br />
              EXPRESS
            </li>
            <li className="grid h-7 min-w-12 place-items-center rounded-sm bg-[#b2fce4] px-3 text-[10px] font-semibold text-[#10251f]">
              afterpay
            </li>
          </ul>
          <div className="flex w-full flex-wrap justify-between gap-3 text-ui-fg-muted">
            <Text className="text-[11px] leading-5">
              © 2022-2026 Petboxnest. All rights reserved.
            </Text>
            <MedusaCTA />
          </div>
        </div>
      </div>
    </footer>
  )
}
