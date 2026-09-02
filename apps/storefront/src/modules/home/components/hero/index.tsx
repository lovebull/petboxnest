import { ArrowRight } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

const Hero = () => {
  return (
    <section className="overflow-hidden bg-cream text-ink">
      <div className="pbn-container grid min-h-[620px] items-center gap-10 py-12 small:grid-cols-[0.9fr_1.1fr] small:py-16 medium:min-h-[680px] medium:gap-16">
        <div className="relative z-10 max-w-[600px]">
          <p className="inline-flex rounded-full bg-mint px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-ink">
            Built for pets. Designed for home.
          </p>
          <h1 className="mt-6 font-display text-[44px] font-bold leading-[0.98] tracking-[-0.055em] text-ink xsmall:text-[54px] medium:text-[68px]">
            Better spaces for pets. Calmer spaces for you.
          </h1>
          <p className="mt-6 max-w-[570px] text-lg leading-8 text-muted">
            Practical litter solutions, cozy resting spots, and everyday pet
            essentials made to feel right at home.
          </p>
          <div className="mt-8 flex flex-col gap-3 xsmall:flex-row">
            <LocalizedClientLink
              href="/store"
              className="pbn-primary-button gap-2"
            >
              Shop best sellers
              <ArrowRight aria-hidden="true" />
            </LocalizedClientLink>
            <LocalizedClientLink
              href="#shop-by-pet"
              className="pbn-secondary-button"
            >
              Shop by pet
            </LocalizedClientLink>
          </div>
          <p className="mt-5 text-sm font-medium text-muted">
            Less cleanup. More cuddle time.
          </p>
        </div>

        <div className="relative min-h-[380px] small:min-h-[540px]">
          <div
            className="absolute -right-16 -top-8 h-48 w-48 rounded-full bg-yellow/75"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-10 -left-8 h-44 w-44 rounded-full bg-mint"
            aria-hidden="true"
          />
          <div className="absolute inset-0 overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-[0_16px_40px_rgba(32,36,51,0.12)]">
            <Image
              src="/images/home/petboxnest-hero.png"
              alt="A cat beside a modern litter box and a dog relaxing in a pet bed at home"
              fill
              priority
              sizes="(max-width: 1023px) 100vw, 55vw"
              className="object-cover object-[58%_center]"
            />
          </div>
          <div className="absolute bottom-5 left-5 rounded-2xl bg-white/95 px-4 py-3 shadow-[0_8px_24px_rgba(32,36,51,0.12)] backdrop-blur-sm">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand">
              Home tested
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">
              For tiny paws and strong opinions.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
