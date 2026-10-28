import { notFound } from "next/navigation"
import { getArticleBySlug } from "@lib/data/payload-articles"
import StoreLayout from "../../../(main)/layout"

export default async function StoryLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ countryCode: string; slug: string }>
}) {
  // Resolve the essential story before rendering the shared, streaming shop
  // shell. Otherwise an ancestor loading boundary commits HTTP 200 too early.
  // React cache shares this request with metadata and the article body.
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  return <StoreLayout>{children}</StoreLayout>
}
