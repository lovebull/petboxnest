import { ArrowRight, CheckCircle } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

const perspectives = [
  {
    label: "The cat checklist",
    title: "A corner that feels considered",
    copy: "Easy-care details, comfortable materials, and practical designs that can settle naturally into the room.",
    image: "/images/home/pet-perspectives/cat.webp",
    imageAlt: "Original illustrated portrait of a curious tabby cat",
    accent: "bg-mint",
  },
  {
    label: "The dog checklist",
    title: "Comfort made for everyday life",
    copy: "Inviting places to rest, useful product information, and choices made for homes that are happily lived in.",
    image: "/images/home/pet-perspectives/dog.webp",
    imageAlt: "Original illustrated portrait of a relaxed caramel-colored dog",
    accent: "bg-sky",
  },
]

const principles = [
  "Clear product details",
  "Practical home fit",
  "Support you can reach",
]

const PetPerspectives = () => {
  return (
    <section
      aria-labelledby="pet-perspectives-heading"
      className="overflow-hidden bg-white py-16 text-ink small:py-24"
    >
      <div className="pbn-container">
        <header className="mx-auto max-w-[760px] text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
            The pet perspective
          </p>
          <h2
            id="pet-perspectives-heading"
            className="mt-3 font-display text-[34px] font-bold leading-tight tracking-[-0.035em] small:text-[48px]"
          >
            Two housemates. One shared standard.
          </h2>
          <p className="mx-auto mt-4 max-w-[650px] text-base leading-7 text-muted small:text-lg small:leading-8">
            PetBoxNest looks for products that make pets comfortable and make
            everyday care feel more manageable for the people sharing the home.
          </p>
        </header>

        <div className="mx-auto mt-10 grid max-w-[1060px] gap-5 small:grid-cols-2 small:gap-7">
          {perspectives.map((item) => (
            <article
              key={item.label}
              className="relative overflow-hidden rounded-[28px] border border-[#E6E8EC] bg-cream p-6 xsmall:p-8 small:p-9"
            >
              <div
                aria-hidden="true"
                className={`absolute -right-16 -top-16 h-52 w-52 rounded-full opacity-45 ${item.accent}`}
              />
              <div className="relative flex items-center gap-5">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white bg-cream shadow-[0_8px_24px_rgba(32,36,51,0.10)] xsmall:h-28 xsmall:w-28">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>
                <p className="max-w-[180px] text-xs font-bold uppercase tracking-[0.14em] text-brand">
                  {item.label}
                </p>
              </div>
              <h3 className="relative mt-7 font-display text-[26px] font-bold leading-tight tracking-[-0.025em]">
                {item.title}
              </h3>
              <p className="relative mt-3 text-base leading-7 text-muted">
                {item.copy}
              </p>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-7 flex max-w-[1060px] flex-col items-center justify-between gap-6 rounded-[24px] bg-ink px-6 py-6 text-white small:flex-row small:px-8">
          <ul className="flex flex-col gap-3 xsmall:flex-row xsmall:flex-wrap xsmall:justify-center small:justify-start">
            {principles.map((principle) => (
              <li
                key={principle}
                className="flex items-center gap-2 text-sm font-bold"
              >
                <CheckCircle
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 text-mint"
                />
                {principle}
              </li>
            ))}
          </ul>
          <LocalizedClientLink
            href="/about-us"
            className="pbn-focus inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-[14px] bg-white px-6 text-sm font-bold text-ink transition duration-200 hover:-translate-y-0.5 hover:bg-cream motion-reduce:transition-none xsmall:w-auto"
          >
            How we choose
            <ArrowRight aria-hidden="true" />
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}

export default PetPerspectives
