import { ArrowRight } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

const cards = [
  {
    title: "For cats",
    copy: "Smarter litter corners, cozy hideaways, and home-friendly essentials.",
    image: "/images/home/shop-cats.png",
    alt: "A cat exploring a modern covered litter box in a warm home",
    accent: "bg-mint",
  },
  {
    title: "For dogs",
    copy: "Comfortable beds, easy-clean mats, and everyday gear for happy lounging.",
    image: "/images/home/shop-dogs.png",
    alt: "A dog resting in a comfortable bed with an easy-clean mat",
    accent: "bg-yellow",
  },
]

const ShopByPet = () => (
  <section id="shop-by-pet" className="bg-white py-16 small:py-24">
    <div className="pbn-container">
      <div className="max-w-[700px]">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
          Shop by pet
        </p>
        <h2 className="mt-3 font-display text-[34px] font-bold leading-tight tracking-[-0.035em] text-ink small:text-[48px]">
          Find a better corner of the house—for both of you.
        </h2>
      </div>
      <div className="mt-10 grid gap-6 small:grid-cols-2">
        {cards.map((card) => (
          <article
            key={card.title}
            className="group relative min-h-[500px] overflow-hidden rounded-[28px] bg-mist small:min-h-[620px]"
          >
            <Image
              src={card.image}
              alt={card.alt}
              fill
              loading="lazy"
              sizes="(max-width: 767px) calc(100vw - 32px), 620px"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
            />
            <div className="absolute inset-x-4 bottom-4 rounded-[22px] bg-white/95 p-6 shadow-[0_8px_24px_rgba(32,36,51,0.08)] backdrop-blur-sm xsmall:inset-x-6 xsmall:bottom-6">
              <span
                className={`inline-block h-2.5 w-12 rounded-full ${card.accent}`}
                aria-hidden="true"
              />
              <h3 className="mt-3 font-display text-[28px] font-bold text-ink">
                {card.title}
              </h3>
              <p className="mt-2 max-w-[480px] text-base leading-7 text-muted">
                {card.copy}
              </p>
              <LocalizedClientLink
                href="/store"
                className="pbn-focus mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg font-bold text-brand hover:text-brand-dark"
              >
                Explore products <ArrowRight aria-hidden="true" />
              </LocalizedClientLink>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
)

export default ShopByPet
