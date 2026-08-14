import { Metadata } from "next"
import { getLatestArticles } from "@lib/data/payload-articles"
import ArticleCard from "@modules/articles/components/article-card"

export const metadata: Metadata = {
  title: "Notes From The Clubhouse | Larumsport",
  description:
    "Read Larumsport stories, court notes, product ideas, and guides from the clubhouse.",
}

export default async function ArticlesPage() {
  const articles = await getLatestArticles({ limit: 24 })

  return (
    <main className="bg-[#f7f3e7] text-ui-fg-base">
      <header className="border-b border-[#ded8c8]">
        <div className="content-container py-16 small:py-24">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-ui-fg-muted">
            Journal
          </p>
          <h1 className="mt-5 max-w-4xl font-serif text-[42px] font-normal leading-[1.05] tracking-[-0.03em] small:text-[72px]">
            Notes From The Clubhouse
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-ui-fg-subtle small:text-lg small:leading-8">
            Stories, playing notes, and product ideas for life on and beyond the
            court.
          </p>
        </div>
      </header>

      <section className="content-container py-14 small:py-24">
        {articles.length ? (
          <div className="grid gap-x-7 gap-y-14 small:grid-cols-2 medium:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <p className="max-w-xl text-sm leading-6 text-ui-fg-subtle">
            No published articles are available yet.
          </p>
        )}
      </section>
    </main>
  )
}
