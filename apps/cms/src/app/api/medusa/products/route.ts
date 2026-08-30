import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

type MedusaProduct = {
  handle?: string
  id?: string
  status?: string
  title?: string
}

type MedusaProductsResponse = {
  products?: MedusaProduct[]
}

const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "http://127.0.0.1:8030"

const MEDUSA_PUBLISHABLE_API_KEY =
  process.env.MEDUSA_PUBLISHABLE_API_KEY ||
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

export async function GET() {
  if (!MEDUSA_PUBLISHABLE_API_KEY) {
    return NextResponse.json(
      {
        error:
          "Missing MEDUSA_PUBLISHABLE_API_KEY or NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY.",
      },
      { status: 500 }
    )
  }

  const productsURL = new URL("/store/products", MEDUSA_BACKEND_URL)
  productsURL.searchParams.set("limit", "100")
  productsURL.searchParams.set("fields", "id,title,handle,status")

  const response = await fetch(productsURL, {
    cache: "no-store",
    headers: {
      "x-publishable-api-key": MEDUSA_PUBLISHABLE_API_KEY,
    },
  })

  if (!response.ok) {
    return NextResponse.json(
      {
        error: `Medusa products request failed with status ${response.status}.`,
      },
      { status: response.status }
    )
  }

  const data = (await response.json()) as MedusaProductsResponse
  const products = (data.products || [])
    .filter((product) => product.id && product.handle)
    .filter((product) => !product.status || product.status === "published")
    .map((product) => ({
      handle: product.handle,
      id: product.id,
      status: product.status,
      title: product.title || product.handle || product.id,
    }))

  return NextResponse.json({ products })
}
