import { Metadata } from "next"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  ArrowRight,
  ChatBubbleLeftRight,
  CheckCircleSolid,
  Heart,
  Sparkles,
} from "@medusajs/icons"

export const metadata: Metadata = {
  title: "About Us | Petboxnest",
  description:
    "Meet Petboxnest, a pet-first home brand creating practical products for happier pets, calmer homes, and everyday care routines.",
}

const storyHighlights = [
  "Practical litter solutions",
  "Cozy resting spots",
  "Everyday pet home essentials",
]

const values = [
  {
    title: "Pets come first",
    description:
      "We start with real habits: curious cats, professional nappers, messy paws, and the little routines that shape a home.",
    icon: Heart,
    accent: "bg-mint",
  },
  {
    title: "Designed to live with",
    description:
      "Products should solve a pet need without making the room feel harder to enjoy, clean, or share.",
    icon: Sparkles,
    accent: "bg-yellow",
  },
  {
    title: "Clear and useful",
    description:
      "We favor helpful details, honest product information, and support that makes choosing the right item easier.",
    icon: CheckCircleSolid,
    accent: "bg-sky",
  },
]

const commitments = [
  "Home-friendly products selected for daily pet life.",
  "Clear product pages, policies, and support before you order.",
  "A calmer shopping experience for cat and dog households.",
]

export default function AboutUsPage() {
  return (
    <main className="overflow-x-clip bg-cream text-ink">
      <header className="relative overflow-hidden border-b border-[#E6E8EC] bg-cream">
        <div
          aria-hidden="true"
          className="absolute -right-24 top-12 h-64 w-64 rounded-full bg-yellow/70 small:right-10 small:h-80 small:w-80"
        />
        <div
          aria-hidden="true"
          className="absolute -left-28 bottom-[-120px] h-72 w-72 rounded-full bg-mint/70"
        />

        <div className="pbn-container relative grid gap-10 py-14 small:grid-cols-[minmax(0,0.9fr)_minmax(440px,1.1fr)] small:items-center small:py-24 medium:gap-16 medium:py-28">
          <div>
            <p className="inline-flex min-h-10 items-center gap-2 rounded-full bg-mint px-4 text-xs font-bold uppercase tracking-[0.16em] text-ink">
              <Heart aria-hidden="true" />
              About Petboxnest
            </p>
            <h1 className="mt-6 max-w-[820px] text-balance font-display text-[44px] font-bold leading-[1.02] tracking-[-0.05em] xsmall:text-[56px] small:text-[72px] medium:text-[80px]">
              Better spaces for pets, calmer homes for you.
            </h1>
            <p className="mt-6 max-w-[660px] text-lg leading-8 text-muted small:text-xl small:leading-9">
              Petboxnest creates practical pet essentials for households that
              want everyday care to feel easier, warmer, and more at home.
            </p>
            <div className="mt-8 flex flex-col gap-3 xsmall:flex-row">
              <LocalizedClientLink
                href="/store"
                className="pbn-primary-button gap-2"
              >
                Shop all products <ArrowRight aria-hidden="true" />
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/contact"
                className="pbn-secondary-button"
              >
                Contact us
              </LocalizedClientLink>
            </div>
          </div>

          <div className="relative min-h-[360px] small:min-h-[560px]">
            <div className="absolute inset-0 overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_16px_40px_rgba(32,36,51,0.12)] small:rounded-[32px]">
              <Image
                src="/images/home/petboxnest-hero.png"
                alt="A cat beside a modern litter box and a dog relaxing in a pet bed inside a warm home"
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 56vw"
                className="object-cover object-[58%_center]"
              />
            </div>
            <div className="absolute bottom-5 left-5 max-w-[270px] rounded-2xl bg-white/95 px-4 py-3 shadow-[0_8px_24px_rgba(32,36,51,0.12)] backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand">
                Playful home comfort
              </p>
              <p className="mt-1 text-sm font-semibold leading-5 text-ink">
                Practical products, happier pets, calmer homes.
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-mist py-14 small:py-20 medium:py-24">
        <div className="pbn-container grid gap-8 small:grid-cols-[320px_minmax(0,1fr)] small:items-start small:gap-10 medium:grid-cols-[360px_minmax(0,1fr)] medium:gap-14">
          <aside className="rounded-[24px] bg-ink p-6 text-white shadow-[0_16px_40px_rgba(32,36,51,0.12)] xsmall:p-8 small:sticky small:top-28 small:rounded-[32px]">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-yellow text-ink">
              <ChatBubbleLeftRight aria-hidden="true" />
            </span>
            <h2 className="mt-6 font-display text-[30px] font-bold leading-tight tracking-[-0.03em]">
              Need help choosing?
            </h2>
            <p className="mt-4 text-base leading-7 text-white/75">
              Our customer care team can help with orders, products, and policy
              questions.
            </p>
            <LocalizedClientLink
              href="/contact"
              className="pbn-focus mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-white px-5 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:bg-cream motion-reduce:transition-none"
            >
              Contact us <ArrowRight aria-hidden="true" />
            </LocalizedClientLink>
          </aside>

          <article className="min-w-0 space-y-6">
            <section className="rounded-[24px] border border-[#E6E8EC] bg-white p-5 shadow-[0_8px_24px_rgba(32,36,51,0.06)] xsmall:p-7 small:rounded-[32px] small:p-10 medium:p-12">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                Our story
              </p>
              <h2 className="mt-4 max-w-[760px] font-display text-[34px] font-bold leading-[1.08] tracking-[-0.04em] xsmall:text-[42px] small:text-[52px]">
                Pet products should make a home easier to live in, not harder.
              </h2>
              <div className="mt-7 grid gap-5 text-base leading-7 text-muted small:text-[17px] small:leading-8">
                <p>
                  Petboxnest began with a simple idea: the best pet products
                  care about both sides of the room. They should support the
                  animals who use them every day and the people who clean,
                  arrange, and share the home around them.
                </p>
                <p>
                  We focus on litter boxes, beds, mats, and versatile pet home
                  essentials that fit naturally into daily life. Every product
                  is selected with usefulness, comfort, and a clean point of
                  view in mind.
                </p>
              </div>

              <ul className="mt-8 grid gap-3 xsmall:grid-cols-3">
                {storyHighlights.map((item) => (
                  <li
                    key={item}
                    className="rounded-[16px] border border-[#E6E8EC] bg-cream p-4 text-sm font-bold leading-5 text-ink"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-[24px] border border-[#E6E8EC] bg-white p-5 shadow-[0_8px_24px_rgba(32,36,51,0.06)] xsmall:p-7 small:rounded-[32px] small:p-10 medium:p-12">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                What guides us
              </p>
              <div className="mt-6 grid gap-4 medium:grid-cols-3">
                {values.map((value) => {
                  const Icon = value.icon

                  return (
                    <article
                      key={value.title}
                      className="rounded-[20px] border border-[#E6E8EC] bg-cream p-5"
                    >
                      <span
                        className={`grid h-12 w-12 place-items-center rounded-2xl text-ink ${value.accent}`}
                      >
                        <Icon aria-hidden="true" />
                      </span>
                      <h3 className="mt-5 font-display text-[24px] font-bold leading-tight tracking-[-0.03em]">
                        {value.title}
                      </h3>
                      <p className="mt-3 text-base leading-7 text-muted">
                        {value.description}
                      </p>
                    </article>
                  )
                })}
              </div>
            </section>

            <section className="overflow-hidden rounded-[24px] border border-[#E6E8EC] bg-white shadow-[0_8px_24px_rgba(32,36,51,0.06)] small:grid small:grid-cols-[0.9fr_1.1fr] small:rounded-[32px]">
              <div className="relative min-h-[220px] xsmall:min-h-[260px] small:min-h-full">
                <Image
                  src="/images/home/shop-cats.png"
                  alt="A cat resting comfortably near home pet essentials"
                  fill
                  loading="eager"
                  sizes="(max-width: 1023px) 100vw, 40vw"
                  className="object-cover object-[48%_center]"
                />
              </div>
              <div className="p-5 xsmall:p-7 small:p-10 medium:p-12">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                  Why choose us
                </p>
                <h2 className="mt-4 font-display text-[32px] font-bold leading-[1.1] tracking-[-0.035em] xsmall:text-[40px]">
                  Thoughtful details for the daily pet routine.
                </h2>
                <ul className="mt-7 space-y-4">
                  {commitments.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-mint text-ink">
                        <CheckCircleSolid aria-hidden="true" />
                      </span>
                      <span className="text-base leading-7 text-muted">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="rounded-[24px] border-2 border-ink bg-yellow p-5 shadow-[0_8px_24px_rgba(32,36,51,0.08)] xsmall:p-7 small:rounded-[32px] small:p-10 medium:p-12">
              <div className="grid gap-6 small:grid-cols-[minmax(0,1fr)_auto] small:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/70">
                    Find their next favorite spot
                  </p>
                  <h2 className="mt-3 max-w-[720px] font-display text-[32px] font-bold leading-[1.1] tracking-[-0.035em] text-ink xsmall:text-[42px]">
                    Explore pet essentials made for messy paws and cozy naps.
                  </h2>
                </div>
                <LocalizedClientLink
                  href="/store"
                  className="pbn-focus inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-ink px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-brand-dark motion-reduce:transition-none"
                >
                  Shop all products <ArrowRight aria-hidden="true" />
                </LocalizedClientLink>
              </div>
            </section>
          </article>
        </div>
      </section>
    </main>
  )
}
