import type { PayloadArticle } from "@lib/data/payload-articles"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowRight, Sparkles } from "@medusajs/icons"

export function getArticleImage(article: PayloadArticle) {
  return (
    article.hero_image_url ||
    article.hero_image?.image_url ||
    article.hero_image?.url
  )
}

export function getArticleThumbnailImage(article: PayloadArticle) {
  return article.hero_image?.sizes?.thumbnail?.url || getArticleImage(article)
}

export function getArticleImageAlt(article: PayloadArticle) {
  return (
    article.hero_image?.alt_text || article.hero_image?.alt || article.title
  )
}

export function formatArticleDate(date?: string | null) {
  if (!date) {
    return ""
  }

  const dateParts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).formatToParts(new Date(date))

  const month = dateParts.find((part) => part.type === "month")?.value
  const day = dateParts.find((part) => part.type === "day")?.value
  const year = dateParts.find((part) => part.type === "year")?.value

  return month && day && year ? `${month} ${day} ${year}` : ""
}

export default function ArticleCard({ article }: { article: PayloadArticle }) {
  const imageUrl = getArticleThumbnailImage(article)
  const imageAlt = getArticleImageAlt(article)
  const date = formatArticleDate(
    article.published_at || article.createdAt || article.updatedAt
  )

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-[#E6E8EC] bg-white shadow-[0_8px_24px_rgba(32,36,51,0.06)] transition duration-200 hover:-translate-y-1 hover:border-brand/30 hover:shadow-[0_16px_40px_rgba(32,36,51,0.1)] motion-reduce:transition-none">
      <LocalizedClientLink
        href={`/articles/${article.slug}`}
        className="pbn-focus block overflow-hidden bg-mist"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageAlt}
            className="aspect-[4/3] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025] motion-reduce:transition-none xsmall:aspect-[16/11]"
            loading="lazy"
          />
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center bg-mint text-brand xsmall:aspect-[16/11]">
            <Sparkles className="h-9 w-9" aria-hidden="true" />
          </div>
        )}
      </LocalizedClientLink>
      <div className="flex flex-1 flex-col p-5 xsmall:p-6">
        {date && (
          <time
            dateTime={
              article.published_at || article.createdAt || article.updatedAt
            }
            className="text-[11px] font-bold uppercase tracking-[0.13em] text-brand"
          >
            {date}
          </time>
        )}
        <h2 className="mt-3 font-display text-[24px] font-bold leading-[1.16] tracking-[-0.025em] text-ink">
          <LocalizedClientLink
            href={`/articles/${article.slug}`}
            className="pbn-focus rounded-lg transition-colors hover:text-brand"
          >
            {article.title}
          </LocalizedClientLink>
        </h2>
        {article.excerpt && (
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted">
            {article.excerpt}
          </p>
        )}
        <LocalizedClientLink
          href={`/articles/${article.slug}`}
          className="pbn-focus mt-auto inline-flex min-h-11 w-fit items-center gap-2 rounded-lg pt-5 text-sm font-bold text-brand transition-colors hover:text-brand-dark"
        >
          Read more <ArrowRight aria-hidden="true" />
        </LocalizedClientLink>
      </div>
    </article>
  )
}
