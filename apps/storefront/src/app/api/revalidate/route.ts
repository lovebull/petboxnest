import { revalidatePath, revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

const CACHE_TAGS = [
  "payload-online-images",
  "payload-articles",
  "payload-product-enhancements",
  "products",
  "categories",
  "collections",
  "regions",
  "carts",
  "customers",
  "orders",
  "fulfillment",
]

const CACHE_PATHS = ["/us", "/us/articles", "/us/store", "/us/categories"]

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET

  if (!secret) {
    return NextResponse.json(
      { message: "REVALIDATE_SECRET is not configured." },
      { status: 500 }
    )
  }

  const authorization = request.headers.get("authorization")
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null

  if (token !== secret) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as {
    tags?: string[]
    paths?: string[]
  }
  const hasExplicitSelection = Array.isArray(body.tags) || Array.isArray(body.paths)
  const tags = hasExplicitSelection ? body.tags ?? [] : CACHE_TAGS
  const paths = hasExplicitSelection ? body.paths ?? [] : CACHE_PATHS

  for (const tag of tags) {
    revalidateTag(tag)
  }

  for (const path of paths) {
    revalidatePath(path)
  }

  return NextResponse.json({
    revalidated: true,
    tags,
    paths,
  })
}
