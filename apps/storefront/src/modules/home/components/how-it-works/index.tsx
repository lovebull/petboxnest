import { ArrowPath, Clock, CursorArrowRays, TruckFast } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const steps = [
  {
    title: "Select Your Setup",
    description: "Pick your box size, quantity, and preferred litter type.",
    icon: CursorArrowRays,
  },
  {
    title: "Delivery to Your Door",
    description:
      "Every Auto-ship order ships free, delivered right when you need it.",
    icon: TruckFast,
  },
  {
    title: "Recycle & Dispose",
    description:
      "After 30 days, dispose of the litter, recycle the box, and set up a fresh one.",
    icon: ArrowPath,
  },
  {
    title: "Flexible Subscription",
    description:
      "Add extra items, adjust, or cancel anytime to fit your needs.",
    icon: Clock,
  },
]

const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="scroll-mt-28 bg-mist px-4 py-16 text-ink small:py-24"
    >
      <div className="mx-auto max-w-[1120px] text-center">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
          Simple by design
        </p>
        <h2
          id="how-it-works-heading"
          className="mt-3 font-display text-[34px] font-bold leading-tight tracking-[-0.035em] small:text-[48px]"
        >
          How It Works
        </h2>
        <p className="mx-auto mt-4 max-w-[760px] text-base leading-7 text-muted small:text-lg">
          Enjoy hassle-free, odor-free cat care with convenient deliveries and
          simple recycling—so you never run out or have to scrub a litter box
          again.
        </p>

        <ol className="mt-10 grid gap-5 xsmall:grid-cols-2 small:grid-cols-4 small:gap-6">
          {steps.map((step) => {
            const Icon = step.icon

            return (
              <li
                key={step.title}
                className="flex min-h-[226px] flex-col items-center rounded-[24px] border border-[#E6E8EC] bg-white px-6 py-7 small:px-5"
              >
                <Icon
                  aria-hidden="true"
                  className="h-14 w-14 shrink-0 text-brand"
                />
                <h3 className="mt-6 text-sm font-bold leading-5">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {step.description}
                </p>
              </li>
            )
          })}
        </ol>

        <LocalizedClientLink
          href="/store"
          className="pbn-primary-button mt-10 min-w-[209px]"
        >
          See Plan Options
        </LocalizedClientLink>
      </div>
    </section>
  )
}

export default HowItWorks
