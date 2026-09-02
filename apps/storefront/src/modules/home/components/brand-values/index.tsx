import { ArrowPath, Heart, Sparkles } from "@medusajs/icons"

const values = [
  {
    title: "Cleanup that fits real life",
    copy: "Easy-care choices and practical details help keep everyday pet mess manageable.",
    icon: ArrowPath,
    color: "bg-mint",
  },
  {
    title: "Comfort they choose",
    copy: "Soft, inviting spaces made for naps, resets, and all-day lounging.",
    icon: Heart,
    color: "bg-sky",
  },
  {
    title: "Design you can live with",
    copy: "Pet essentials with calm colors and thoughtful forms that belong in your home.",
    icon: Sparkles,
    color: "bg-yellow",
  },
]

const BrandValues = () => (
  <section className="bg-cream py-16 small:py-24">
    <div className="pbn-container">
      <div className="grid gap-10 medium:grid-cols-[0.85fr_1.15fr] medium:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
            Why PetBoxNest
          </p>
          <h2 className="mt-3 font-display text-[34px] font-bold leading-tight tracking-[-0.035em] text-ink small:text-[48px]">
            Pet products shouldn&apos;t make your home harder to live in.
          </h2>
        </div>
        <p className="max-w-[620px] text-lg leading-8 text-muted medium:justify-self-end">
          We look for the useful details first—less fuss, real comfort, and a
          design that works beyond the pet aisle.
        </p>
      </div>
      <div className="mt-10 grid gap-5 small:grid-cols-3">
        {values.map((value) => {
          const Icon = value.icon
          return (
            <article
              key={value.title}
              className="rounded-[24px] border border-[#E6E8EC] bg-white p-7"
            >
              <span
                className={`grid h-14 w-14 place-items-center rounded-2xl text-ink ${value.color}`}
              >
                <Icon className="h-7 w-7" aria-hidden="true" />
              </span>
              <h3 className="mt-6 font-display text-xl font-bold text-ink">
                {value.title}
              </h3>
              <p className="mt-3 text-base leading-7 text-muted">
                {value.copy}
              </p>
            </article>
          )
        })}
      </div>
    </div>
  </section>
)

export default BrandValues
