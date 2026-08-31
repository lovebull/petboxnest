import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getArticleBySlug } from "@lib/data/payload-articles"
import {
  formatArticleDate,
  getArticleImage,
} from "@modules/articles/components/article-card"
import RichText from "@modules/articles/components/rich-text"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Props = {
  params: Promise<{
    countryCode: string
    slug: string
  }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const article = await getArticleBySlug(params.slug)

  if (!article) {
    return {
      title: "Article Not Found | Petboxnest",
    }
  }

  const title = article.seo?.meta_title || `${article.title} | Petboxnest`
  const description =
    article.seo?.meta_description ||
    article.excerpt ||
    "Read the latest from Petboxnest."
  const image = article.seo?.og_image?.url || getArticleImage(article)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [image] : [],
    },
  }
}

export default async function ArticlePage(props: Props) {
  const params = await props.params
  const article = await getArticleBySlug(params.slug)

  if (!article) {
    notFound()
  }

  const imageUrl = getArticleImage(article)
  const imageAlt = article.hero_image?.alt || article.title
  const date = formatArticleDate(
    article.published_at || article.createdAt || article.updatedAt,
  )

  return (
    <article className="bg-[#f7f3e7] text-ui-fg-base">
      <header className="border-b border-[#ded8c8]">
        <div className="content-container py-12 small:py-20">
          <LocalizedClientLink
            href="/articles"
            className="inline-flex border-b border-ui-fg-base pb-0.5 text-xs font-medium uppercase tracking-[0.14em] transition-opacity hover:opacity-60"
          >
            Back to articles
          </LocalizedClientLink>
          {date && (
            <p className="mt-10 text-xs font-medium uppercase tracking-[0.18em] text-ui-fg-muted">
              {date}
            </p>
          )}
          <h1 className="mt-5 max-w-5xl font-serif text-[42px] font-normal leading-[1.05] tracking-[-0.03em] small:text-[76px]">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="mt-7 max-w-2xl text-base leading-7 text-ui-fg-subtle small:text-lg small:leading-8">
              {article.excerpt}
            </p>
          )}
        </div>
      </header>

      {imageUrl && (
        <div className="content-container pt-10 small:pt-16">
          <img
            src={imageUrl}
            alt={imageAlt}
            className="aspect-[16/9] w-full object-cover"
            loading="eager"
          />
        </div>
      )}

      <div className="content-container py-12 small:py-20">
        <div className="mx-auto max-w-[760px]">
          <RichText content={article.content} />
        </div>
      </div>
    </article>
  )
}
