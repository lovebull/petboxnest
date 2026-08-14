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
    <section
      id="clubhouse-notes"
      className="content-container pb-14 pt-10 small:py-23"
    >
      <div className="mb-9 flex items-end justify-between gap-2 small:mb-11 small:gap-6">
        <h2 className="whitespace-nowrap font-serif text-[22px] font-normal leading-none tracking-[-0.01em] text-ui-fg-base small:text-[42px] small:leading-tight small:tracking-[-0.02em]">
          Notes From The Clubhouse
        </h2>
        <LocalizedClientLink
          href="/articles"
          className="shrink-0 border-b border-ui-fg-base pb-0.5 text-[10px] text-ui-fg-base transition-opacity hover:opacity-60 small:text-xs"
        >
          View all posts
        </LocalizedClientLink>
      </div>

      <div className="grid gap-x-5 gap-y-12 small:grid-cols-2 medium:grid-cols-3 medium:gap-x-7">
        {articles.map((article) => {
          const imageUrl = getArticleImage(article)
          const imageAlt = article.hero_image?.alt || article.title
          const date = formatArticleDate(
            article.published_at || article.createdAt || article.updatedAt,
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
              <h3 className="mt-3 max-w-[420px] font-serif text-[23px] font-normal leading-[1.18] tracking-[-0.01em] text-ui-fg-base">
                <LocalizedClientLink
                  href={`/articles/${article.slug}`}
                  className="transition-opacity hover:opacity-60"
                >
                  {article.title}
                </LocalizedClientLink>
              </h3>
              <LocalizedClientLink
                href={`/articles/${article.slug}`}
                className="mt-4 inline-block border-b border-ui-fg-base pb-0.5 text-xs text-ui-fg-base transition-opacity hover:opacity-60"
              >
                Read more
              </LocalizedClientLink>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default ClubhouseNotes
