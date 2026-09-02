import { Metadata } from "next"
import { getLatestArticles } from "@lib/data/payload-articles"
import ArticleCard, {
  formatArticleDate,
  getArticleImage,
  getArticleImageAlt,
} from "@modules/articles/components/article-card"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowRight, Heart, Sparkles } from "@medusajs/icons"

export const metadata: Metadata = {
  title: "The Nest Journal | PetBoxNest",
  description:
    "Read PetBoxNest pet care ideas, home-friendly guides, and stories for happier pets and calmer homes.",
}

export default async function ArticlesPage() {
  const articles = await getLatestArticles({ limit: 24 })
  const [featuredArticle, ...remainingArticles] = articles
  const featuredImage = featuredArticle
    ? getArticleImage(featuredArticle)
    : undefined
  const featuredDateValue = featuredArticle
    ? featuredArticle.published_at ||
      featuredArticle.createdAt ||
      featuredArticle.updatedAt
    : undefined
  const featuredDate = formatArticleDate(featuredDateValue)

  return (
    <main className="overflow-x-clip bg-cream text-ink">
      <header className="relative overflow-hidden border-b border-[#E6E8EC]">
        <div
          className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-yellow/70 small:right-12 small:h-96 small:w-96"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-32 -left-28 h-72 w-72 rounded-full bg-mint/80 small:h-96 small:w-96"
          aria-hidden="true"
        />

        <div className="pbn-container relative grid gap-9 py-14 xsmall:py-16 small:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)] small:items-center small:gap-14 small:py-24 medium:py-28">
          <div>
            <p className="inline-flex min-h-10 items-center gap-2 rounded-full bg-mint px-4 text-xs font-bold uppercase tracking-[0.16em] text-ink">
              <Sparkles aria-hidden="true" />
              The PetBoxNest journal
            </p>
            <h1 className="mt-6 max-w-[800px] text-balance font-display text-[42px] font-bold leading-[1.02] tracking-[-0.045em] xsmall:text-[52px] small:text-[68px] medium:text-[76px]">
              Small ideas for happier pets and calmer homes.
            </h1>
            <p className="mt-6 max-w-[660px] text-lg leading-8 text-muted small:text-xl small:leading-9">
              Helpful guides, honest pet-life notes, and practical inspiration
              for every well-loved corner of your home.
            </p>
            <a href="#latest-stories" className="pbn-primary-button mt-8 gap-2">
              Explore the journal <ArrowRight aria-hidden="true" />
            </a>
          </div>

          <aside className="relative rounded-[24px] border-2 border-ink bg-yellow p-6 shadow-[0_16px_40px_rgba(32,36,51,0.12)] xsmall:p-8 small:rotate-2 small:rounded-[32px]">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-brand">
              <Heart aria-hidden="true" />
            </span>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-ink/65">
              Life in the nest
            </p>
            <p className="mt-3 font-display text-[28px] font-bold leading-tight tracking-[-0.03em] xsmall:text-[34px]">
              Built for pets. Written for the people who share a home with them.
            </p>
            <div
              className="absolute -bottom-4 right-8 h-8 w-8 rotate-45 border-b-2 border-r-2 border-ink bg-yellow"
              aria-hidden="true"
            />
          </aside>
        </div>
      </header>

      <section
        id="latest-stories"
        className="scroll-mt-24 py-14 xsmall:py-16 small:py-24"
      >
        <div className="pbn-container">
          {featuredArticle ? (
            <>
              <div className="mb-7 flex items-end justify-between gap-4 small:mb-10">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                    Start here
                  </p>
                  <h2 className="mt-3 font-display text-[30px] font-bold leading-tight tracking-[-0.035em] small:text-[44px]">
                    The latest from the Nest
                  </h2>
                </div>
                <span className="hidden rounded-full bg-mist px-4 py-2 text-xs font-bold text-muted xsmall:inline-flex">
                  Freshly published
                </span>
              </div>

              <article className="group grid overflow-hidden rounded-[24px] border border-[#E6E8EC] bg-white shadow-[0_8px_24px_rgba(32,36,51,0.08)] small:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)] small:rounded-[32px]">
                <LocalizedClientLink
                  href={`/articles/${featuredArticle.slug}`}
                  className="pbn-focus block min-h-[240px] overflow-hidden bg-mist xsmall:min-h-[320px] small:min-h-[500px]"
                >
                  {featuredImage ? (
                    <img
                      src={featuredImage}
                      alt={getArticleImageAlt(featuredArticle)}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none"
                      loading="eager"
                    />
                  ) : (
                    <div className="flex h-full min-h-[240px] items-center justify-center bg-mint text-brand">
                      <Sparkles className="h-10 w-10" aria-hidden="true" />
                    </div>
                  )}
                </LocalizedClientLink>

                <div className="flex flex-col justify-center p-6 xsmall:p-8 small:p-10 medium:p-12">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.13em] text-muted">
                    <span className="rounded-full bg-yellow px-3 py-2 text-ink">
                      Featured note
                    </span>
                    {featuredDate && (
                      <time dateTime={featuredDateValue}>{featuredDate}</time>
                    )}
                  </div>
                  <h3 className="mt-5 font-display text-[30px] font-bold leading-[1.08] tracking-[-0.035em] xsmall:text-[36px] small:text-[42px]">
                    <LocalizedClientLink
                      href={`/articles/${featuredArticle.slug}`}
                      className="pbn-focus rounded-lg transition-colors hover:text-brand"
                    >
                      {featuredArticle.title}
                    </LocalizedClientLink>
                  </h3>
                  {featuredArticle.excerpt && (
                    <p className="mt-5 text-base leading-7 text-muted">
                      {featuredArticle.excerpt}
                    </p>
                  )}
                  <LocalizedClientLink
                    href={`/articles/${featuredArticle.slug}`}
                    className="pbn-primary-button mt-7 w-full gap-2 xsmall:w-fit"
                  >
                    Read this story <ArrowRight aria-hidden="true" />
                  </LocalizedClientLink>
                </div>
              </article>

              {remainingArticles.length > 0 && (
                <div className="mt-16 small:mt-24">
                  <div className="mb-8 small:mb-10">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                      Keep reading
                    </p>
                    <h2 className="mt-3 font-display text-[30px] font-bold leading-tight tracking-[-0.035em] small:text-[44px]">
                      More from the Nest
                    </h2>
                  </div>
                  <div className="grid gap-6 xsmall:grid-cols-2 medium:grid-cols-3 medium:gap-7">
                    {remainingArticles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-[24px] border-2 border-ink bg-yellow p-6 xsmall:p-9 small:rounded-[32px] small:p-12">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-brand">
                <Sparkles aria-hidden="true" />
              </span>
              <h2 className="mt-6 font-display text-[30px] font-bold leading-tight tracking-[-0.035em] small:text-[44px]">
                The Nest is quiet for now.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-ink/75">
                No published articles are available yet. Come back soon for
                useful ideas for life with pets.
              </p>
              <LocalizedClientLink
                href="/store"
                className="pbn-focus mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-ink px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-brand-dark motion-reduce:transition-none"
              >
                Explore PetBoxNest <ArrowRight aria-hidden="true" />
              </LocalizedClientLink>
            </div>
          )}
        </div>
      </section>

      <aside className="bg-ink py-14 text-white small:py-20">
        <div className="pbn-container grid gap-8 small:grid-cols-[1fr_auto] small:items-center">
          <div className="max-w-[720px]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-yellow">
              Find their next favorite spot
            </p>
            <h2 className="mt-3 font-display text-[32px] font-bold leading-tight tracking-[-0.035em] small:text-[44px]">
              Ideas are good. A cozier corner is even better.
            </h2>
            <p className="mt-4 text-base leading-7 text-white/70">
              Explore practical pet-home products designed for real routines,
              real messes, and very particular nappers.
            </p>
          </div>
          <LocalizedClientLink
            href="/store"
            className="pbn-focus inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-white px-6 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:bg-cream motion-reduce:transition-none"
          >
            Shop PetBoxNest <ArrowRight aria-hidden="true" />
          </LocalizedClientLink>
        </div>
      </aside>
    </main>
  )
}
