import {
  ArrowRight,
  ChatBubble,
  CheckCircle,
  ShieldCheck,
} from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const proof = [
  {
    title: "Know before you buy",
    copy: "Clear product information and real pricing help you make the right call for your space.",
    icon: CheckCircle,
    href: "/store",
    link: "Browse the collection",
  },
  {
    title: "Policies without guesswork",
    copy: "Read shipping and refund details before checkout—no mystery fine print.",
    icon: ShieldCheck,
    href: "/refund-policy",
    link: "Read our policies",
  },
  {
    title: "A real support path",
    copy: "Questions about an order or product? Our contact route is always easy to find.",
    icon: ChatBubble,
    href: "/contact",
    link: "Contact support",
  },
]

const SocialProof = () => (
  <section className="bg-ink py-16 text-white small:py-24">
    <div className="pbn-container">
      <div className="max-w-[760px]">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-yellow">
          Trust is in the details
        </p>
        <h2 className="mt-3 font-display text-[34px] font-bold leading-tight tracking-[-0.035em] text-white small:text-[48px]">
          Trust that lives in the details.
        </h2>
        <p className="mt-4 max-w-[650px] text-lg leading-8 text-white/70">
          PetBoxNest keeps the practical information close, so shopping feels as
          calm as the home you&apos;re building.
        </p>
      </div>
      <div className="mt-10 grid gap-5 small:grid-cols-3">
        {proof.map((item) => {
          const Icon = item.icon
          return (
            <article
              key={item.title}
              className="rounded-[24px] border border-white/15 bg-white/5 p-7"
            >
              <Icon className="h-7 w-7 text-mint" aria-hidden="true" />
              <h3 className="mt-6 font-display text-xl font-bold">
                {item.title}
              </h3>
              <p className="mt-3 text-base leading-7 text-white/70">
                {item.copy}
              </p>
              <LocalizedClientLink
                href={item.href}
                className="pbn-focus mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg font-bold text-yellow hover:text-white"
              >
                {item.link} <ArrowRight aria-hidden="true" />
              </LocalizedClientLink>
            </article>
          )
        })}
      </div>
    </div>
  </section>
)

export default SocialProof
