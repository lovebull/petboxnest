import { getLatestArticles } from "@lib/data/payload-articles"
import {
  formatArticleDate,
  getArticleImage,
} from "@modules/articles/components/article-card"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const ClubhouseNotes = async () => {
  const articles = await getLatestArticles({ limit: 3 })

  if (!articles.length) {
    return null
  }

  return (
    <section id="clubhouse-notes" className="bg-white py-16 small:py-24">
      <div className="pbn-container">
        <div className="mb-9 flex items-end justify-between gap-2 small:mb-11 small:gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
              Life in the nest
            </p>
            <h2 className="mt-3 font-display text-[30px] font-bold leading-tight tracking-[-0.035em] text-ink small:text-[44px]">
              Notes for happier pet homes
            </h2>
          </div>
          <LocalizedClientLink
            href="/articles"
            className="pbn-focus hidden min-h-11 shrink-0 items-center rounded-lg font-bold text-brand hover:text-brand-dark xsmall:flex"
          >
            View all posts
          </LocalizedClientLink>
        </div>

        <div className="grid gap-x-5 gap-y-12 small:grid-cols-2 medium:grid-cols-3 medium:gap-x-7">
          {articles.map((article) => {
            const imageUrl = getArticleImage(article)
            const imageAlt = article.hero_image?.alt || article.title
            const date = formatArticleDate(
              article.published_at || article.createdAt || article.updatedAt
            )

            return (
              <article key={article.id} className="group">
                <LocalizedClientLink
                  href={`/articles/${article.slug}`}
                  className="block overflow-hidden"
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={imageAlt}
                      className="aspect-[16/10] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="aspect-[16/10] w-full bg-ui-bg-subtle" />
                  )}
                </LocalizedClientLink>
                {date && (
                  <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.13em] text-ui-fg-muted">
                    {date}
                  </p>
                )}
                <h3 className="mt-3 max-w-[420px] font-display text-[22px] font-bold leading-[1.2] tracking-[-0.02em] text-ink">
                  <LocalizedClientLink
                    href={`/articles/${article.slug}`}
                    className="transition-opacity hover:opacity-60"
                  >
                    {article.title}
                  </LocalizedClientLink>
                </h3>
                <LocalizedClientLink
                  href={`/articles/${article.slug}`}
                  className="pbn-focus mt-4 inline-flex min-h-11 items-center rounded-lg text-xs font-bold text-brand hover:text-brand-dark"
                >
                  Read more
                </LocalizedClientLink>
              </article>
            )
          })}
        </div>
        <LocalizedClientLink
          href="/articles"
          className="pbn-secondary-button mt-8 w-full xsmall:hidden"
        >
          View all posts
        </LocalizedClientLink>
      </div>
    </section>
  )
}

export default ClubhouseNotes
