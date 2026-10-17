import Image from "next/image"

const perspectives = [
  {
    label: "Litter box hygiene",
    title: "Keep the routine clean—and notice what changes.",
    quote:
      "A litter setup should be simple to keep clean and easy to check every day. If a cat suddenly changes where or how they eliminate, that is a reason to speak with a veterinarian—not just switch products.",
    sourceLabel: "Veterinary care perspective",
    image: "/images/home/care-perspectives/veterinary-editor-woman.webp",
    imageAlt:
      "woman veterinarian",
    accent: "bg-coral",
    wash: "bg-coral/10",
  },
  {
    label: "Multi-cat households",
    title: "Give every cat a comfortable way in—and another option.",
    quote:
      "Common feline-care guidance recommends one litter box per cat, plus one extra, placed in separate quiet locations. The goal is less competition, easier access, and a calmer daily routine.",
    sourceLabel: "Feline environment perspective",
    image: "/images/home/care-perspectives/veterinary-editor-man.webp",
    imageAlt:
      "man veterinarian",
    accent: "bg-mint",
    wash: "bg-mint/20",
  },
]

const guidanceSources = [
  {
    name: "Cornell Feline Health Center",
    detail: "Litter box behavior and household setup",
    href: "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/feline-behavior-problems-house-soiling",
  },
  {
    name: "Feline Veterinary Medical Association",
    detail: "Cat-friendly environmental guidance",
    href: "https://catvets.com/wp-content/uploads/2024/06/CFPGuide23-en.pdf",
  },
]

const CarePerspectives = () => {
  return (
    <section
      aria-labelledby="care-perspectives-heading"
      className="relative isolate overflow-hidden bg-cream py-16 text-ink small:py-24"
    >
      <div
        aria-hidden="true"
        className="absolute -left-24 top-20 -z-10 h-72 w-72 rounded-full bg-sky/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-28 bottom-0 -z-10 h-80 w-80 rounded-full bg-mint/35 blur-3xl"
      />

      <div className="pbn-container">
        <header className="mx-auto max-w-[800px] text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
            Veterinary-informed perspectives
          </p>
          <h2
            id="care-perspectives-heading"
            className="mt-3 font-display text-[34px] font-bold leading-tight tracking-[-0.035em] small:text-[48px]"
          >
            Better routines begin with a cleaner, calmer setup.
          </h2>
          <p className="mx-auto mt-4 max-w-[700px] text-base leading-7 text-muted small:text-lg small:leading-8">
            We turn trusted feline-care guidance into practical questions for
            the products we choose: Is it easy to maintain, comfortable to use,
            and clear enough to help pet parents notice when something changes?
          </p>
        </header>

        <div className="mx-auto mt-10 grid max-w-[1120px] gap-5 small:grid-cols-2 small:gap-7">
          {perspectives.map((perspective) => (
            <article
              key={perspective.label}
              className="relative overflow-hidden rounded-[28px] border border-brand/15 bg-white p-6 xsmall:p-8 small:p-9"
            >
              <div
                aria-hidden="true"
                className={`absolute -right-14 -top-20 h-56 w-56 rounded-full ${perspective.wash}`}
              />

              <div className="relative flex items-center gap-5">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white bg-mist shadow-[0_8px_24px_rgba(32,36,51,0.10)] xsmall:h-28 xsmall:w-28">
                  <Image
                    src={perspective.image}
                    alt={perspective.imageAlt}
                    fill
                    sizes="112px"
                    loading="lazy"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <span
                    aria-hidden="true"
                    className={`mb-3 block h-1.5 w-10 rounded-full ${perspective.accent}`}
                  />
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
                    {perspective.label}
                  </p>
                  <p className="mt-1 text-sm font-medium leading-5 text-muted">
                    {perspective.sourceLabel}
                  </p>
                </div>
              </div>

              <h3 className="relative mt-7 font-display text-[25px] font-bold leading-tight tracking-[-0.025em] small:text-[28px]">
                {perspective.title}
              </h3>
              <blockquote className="relative mt-4 border-l-2 border-brand/25 pl-5 text-base leading-7 text-muted small:text-[17px] small:leading-8">
                “{perspective.quote}”
              </blockquote>
              {/* <p className="relative mt-6 text-xs leading-5 text-muted">
                Portrait is an original editorial visualization, not a named
                veterinarian endorsement.
              </p> */}
            </article>
          ))}
        </div>

        <aside
          aria-label="Independent feline care references"
          className="mx-auto mt-7 max-w-[1120px] rounded-[24px] border border-ink/10 bg-white/70 px-6 py-5 backdrop-blur-sm small:flex small:items-center small:justify-between small:gap-8 small:px-8"
        >
          <div className="max-w-[360px]">
            <p className="text-sm font-bold text-ink">Independent guidance</p>
            <p className="mt-1 text-xs leading-5 text-muted">
              These sources inform the care principles above; they do not
              endorse PetBoxNest or its products.
            </p>
          </div>
          <ul className="mt-4 grid gap-3 small:mt-0 small:grid-cols-2 small:gap-4">
            {guidanceSources.map((source) => (
              <li key={source.name}>
                <a
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl border border-brand/15 bg-white px-4 py-3 transition-colors hover:border-brand/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  <span className="block text-sm font-bold text-ink">
                    {source.name}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-muted">
                    {source.detail}
                  </span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  )
}

export default CarePerspectives
