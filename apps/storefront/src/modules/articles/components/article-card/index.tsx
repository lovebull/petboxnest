import type { PayloadArticle } from "@lib/data/payload-articles"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export function getArticleImage(article: PayloadArticle) {
  return (
    article.hero_image_url ||
    article.hero_image?.image_url ||
    article.hero_image?.url
  )
}

export function getArticleImageAlt(article: PayloadArticle) {
  return article.hero_image?.alt_text || article.hero_image?.alt || article.title
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
  const imageUrl = getArticleImage(article)
  const imageAlt = getArticleImageAlt(article)
  const date = formatArticleDate(
    article.published_at || article.createdAt || article.updatedAt,
  )

  return (
    <article className="group">
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
      <h2 className="mt-3 max-w-[520px] font-serif text-[25px] font-normal leading-[1.16] tracking-[-0.01em] text-ui-fg-base">
        <LocalizedClientLink
          href={`/articles/${article.slug}`}
          className="transition-opacity hover:opacity-60"
        >
          {article.title}
        </LocalizedClientLink>
      </h2>
      {article.excerpt && (
        <p className="mt-4 max-w-[560px] text-sm leading-6 text-ui-fg-subtle">
          {article.excerpt}
        </p>
      )}
      <LocalizedClientLink
        href={`/articles/${article.slug}`}
        className="mt-5 inline-block border-b border-ui-fg-base pb-0.5 text-xs text-ui-fg-base transition-opacity hover:opacity-60"
      >
        Read more
      </LocalizedClientLink>
    </article>
  )
}
