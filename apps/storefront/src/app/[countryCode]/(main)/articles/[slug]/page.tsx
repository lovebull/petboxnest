import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getArticleBySlug, getLatestArticles } from "@lib/data/payload-articles"
import { getBaseURL } from "@lib/util/env"
import {
  formatArticleDate,
  getArticleImage,
  getArticleImageAlt,
} from "@modules/articles/components/article-card"
import RichText from "@modules/articles/components/rich-text"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowLeft, ArrowRight, Sparkles } from "@medusajs/icons"

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
      title: "Article Not Found | PetBoxNest",
    }
  }

  const title = article.seo?.meta_title || `${article.title} | PetBoxNest`
  const description =
    article.seo?.meta_description ||
    article.excerpt ||
    "Read the latest from PetBoxNest."
  const image = article.seo?.og_image?.url || getArticleImage(article)

  return {
    title,
    description,
    alternates: {
      canonical: `/${params.countryCode}/articles/${params.slug}`,
    },
    openGraph: {
      type: "article",
      siteName: "PetBoxNest",
      title,
      description,
      url: `/${params.countryCode}/articles/${params.slug}`,
      images: image ? [image] : [],
      publishedTime: article.published_at || undefined,
      modifiedTime: article.updatedAt || undefined,
      authors: article.author ? [article.author] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : ["/twitter-image.jpg"],
    },
  }
}

export default async function ArticlePage(props: Props) {
  const params = await props.params
  const [article, articles] = await Promise.all([
    getArticleBySlug(params.slug),
    getLatestArticles({ limit: 100 }),
  ])

  if (!article) {
    notFound()
  }

  const currentArticleIndex = articles.findIndex(
    (item) => item.slug === article.slug,
  )
  const previousArticle =
    currentArticleIndex >= 0 ? articles[currentArticleIndex + 1] : undefined
  const nextArticle =
    currentArticleIndex > 0 ? articles[currentArticleIndex - 1] : undefined

  const imageUrl = getArticleImage(article)
  const imageAlt = getArticleImageAlt(article)
  const articleDate =
    article.published_at || article.createdAt || article.updatedAt
  const date = formatArticleDate(articleDate)
  const baseUrl = getBaseURL().replace(/\/$/, "")
  const articleUrl = `${baseUrl}/${params.countryCode}/articles/${encodeURIComponent(article.slug)}`
  const articleDescription =
    article.seo?.meta_description ||
    article.excerpt ||
    "Read the latest from PetBoxNest."
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${articleUrl}#article`,
        headline: article.title,
        description: articleDescription,
        url: articleUrl,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": articleUrl,
        },
        ...(imageUrl ? { image: [imageUrl] } : {}),
        ...(article.published_at
          ? { datePublished: article.published_at }
          : {}),
        ...(article.updatedAt ? { dateModified: article.updatedAt } : {}),
        author: {
          "@type": "Organization",
          name: article.author || "PetBoxNest Editorial Team",
        },
        publisher: {
          "@type": "Organization",
          name: "PetBoxNest",
          url: baseUrl,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${articleUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${baseUrl}/${params.countryCode}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "The Nest Journal",
            item: `${baseUrl}/${params.countryCode}/articles`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: article.title,
            item: articleUrl,
          },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <article className="overflow-hidden bg-cream text-ink">
      <header className="relative border-b border-[#E6E8EC]">
        <div
          className="absolute -right-20 top-20 h-64 w-64 rounded-full bg-yellow/70"
          aria-hidden="true"
        />
        <div
          className="absolute -left-24 bottom-8 h-52 w-52 rounded-full bg-mint/80"
          aria-hidden="true"
        />
        <div className="pbn-container relative py-12 small:py-20 medium:py-24">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-sm"
          >
            <LocalizedClientLink
              href="/articles"
              className="pbn-focus inline-flex min-h-11 items-center gap-2 rounded-lg font-bold text-brand transition-colors hover:text-brand-dark"
            >
              <ArrowLeft aria-hidden="true" />
              The Nest journal
            </LocalizedClientLink>
          </nav>

          <div className="mx-auto mt-8 max-w-[980px] text-center small:mt-12">
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold uppercase tracking-[0.15em] text-muted">
              <span className="rounded-full bg-mint px-4 py-2 text-ink">
                PetBoxNest journal
              </span>
              {date && (
                <time dateTime={articleDate} className="px-1 py-2">
                  {date}
                </time>
              )}
            </div>
            <h1 className="mt-6 text-balance font-display text-[42px] font-bold leading-[1.02] tracking-[-0.05em] text-ink xsmall:text-[52px] small:text-[68px] medium:text-[76px]">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="mx-auto mt-6 max-w-[720px] text-lg leading-8 text-muted small:text-xl small:leading-9">
                {article.excerpt}
              </p>
            )}
          </div>
        </div>
      </header>

      {imageUrl && (
        <div className="pbn-container relative pt-8 small:pt-14">
          <div className="overflow-hidden rounded-[24px] border border-white bg-mist shadow-[0_16px_40px_rgba(32,36,51,0.12)] small:rounded-[32px]">
            <img
              src={imageUrl}
              alt={imageAlt}
              className="aspect-[4/3] w-full object-cover xsmall:aspect-[16/10] small:aspect-[16/9]"
              loading="eager"
            />
          </div>
        </div>
      )}

      <div className="pbn-container py-12 small:py-20 medium:py-24">
        <div className="mx-auto max-w-[820px] rounded-[24px] border border-[#E6E8EC] bg-white px-5 py-9 shadow-[0_8px_24px_rgba(32,36,51,0.08)] xsmall:px-8 small:rounded-[32px] small:px-14 small:py-14">
          <div className="mb-8 flex items-center gap-3 border-b border-[#E6E8EC] pb-6 text-sm font-bold text-brand">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-yellow text-ink">
              <Sparkles aria-hidden="true" />
            </span>
            A little something for better pet homes
          </div>
          <RichText content={article.content} />
        </div>

        {(previousArticle || nextArticle) && (
          <nav
            aria-label="Article pagination"
            className="mx-auto mt-8 grid max-w-[820px] gap-4 small:mt-10 small:grid-cols-2"
          >
            {previousArticle ? (
              <LocalizedClientLink
                href={`/articles/${previousArticle.slug}`}
                rel="prev"
                className="pbn-focus group flex min-h-28 items-center gap-4 rounded-[20px] border border-[#E6E8EC] bg-white p-5 text-left shadow-[0_8px_24px_rgba(32,36,51,0.06)] transition hover:-translate-y-0.5 hover:border-brand/40 motion-reduce:transition-none"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-mint text-ink transition-colors group-hover:bg-yellow">
                  <ArrowLeft aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold uppercase tracking-[0.14em] text-brand">
                    Previous article
                  </span>
                  <span className="mt-2 line-clamp-2 block font-display text-lg font-bold leading-snug text-ink">
                    {previousArticle.title}
                  </span>
                </span>
              </LocalizedClientLink>
            ) : (
              <span className="hidden small:block" aria-hidden="true" />
            )}

            {nextArticle && (
              <LocalizedClientLink
                href={`/articles/${nextArticle.slug}`}
                rel="next"
                className="pbn-focus group flex min-h-28 items-center justify-between gap-4 rounded-[20px] border border-[#E6E8EC] bg-white p-5 text-right shadow-[0_8px_24px_rgba(32,36,51,0.06)] transition hover:-translate-y-0.5 hover:border-brand/40 motion-reduce:transition-none"
              >
                <span className="min-w-0">
                  <span className="block text-xs font-bold uppercase tracking-[0.14em] text-brand">
                    Next article
                  </span>
                  <span className="mt-2 line-clamp-2 block font-display text-lg font-bold leading-snug text-ink">
                    {nextArticle.title}
                  </span>
                </span>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-mint text-ink transition-colors group-hover:bg-yellow">
                  <ArrowRight aria-hidden="true" />
                </span>
              </LocalizedClientLink>
            )}
          </nav>
        )}
      </div>

      <aside
        className="bg-ink py-14 text-white small:py-20"
        aria-labelledby="article-next-heading"
      >
        <div className="pbn-container grid gap-8 small:grid-cols-[1fr_auto] small:items-center">
          <div className="max-w-[720px]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-yellow">
              Keep exploring
            </p>
            <h2
              id="article-next-heading"
              className="mt-3 font-display text-[32px] font-bold leading-tight tracking-[-0.035em] small:text-[44px]"
            >
              More useful ideas for life with pets.
            </h2>
            <p className="mt-4 text-base leading-7 text-white/70">
              Read another note from the Nest, or find something practical for
              their favorite corner.
            </p>
          </div>
          <div className="flex flex-col gap-3 xsmall:flex-row small:flex-col medium:flex-row">
            <LocalizedClientLink
              href="/articles"
              className="pbn-focus inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-white px-6 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:bg-cream motion-reduce:transition-none"
            >
              More stories <ArrowRight aria-hidden="true" />
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/store"
              className="pbn-focus inline-flex min-h-12 items-center justify-center rounded-[14px] border-2 border-white/50 px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:border-white motion-reduce:transition-none"
            >
              Shop PetBoxNest
            </LocalizedClientLink>
          </div>
        </div>
      </aside>
      </article>
    </>
  )
}
