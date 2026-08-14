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

  for (const tag of CACHE_TAGS) {
    revalidateTag(tag)
  }

  for (const path of CACHE_PATHS) {
    revalidatePath(path)
  }

  return NextResponse.json({
    revalidated: true,
    tags: CACHE_TAGS,
    paths: CACHE_PATHS,
  })
}
