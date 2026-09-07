import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProductEnhancement } from "@lib/data/payload-product-enhancements"
import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import { getPayloadServerUrl } from "@lib/util/public-url"
import { getBaseURL } from "@lib/util/env"
import ProductTemplate from "@modules/products/templates"
import { HttpTypes } from "@medusajs/types"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{
    v_id?: string
    review_page?: string
    review_rating?: string
    review_q?: string
    review_sort?: string
  }>
}

export async function generateStaticParams() {
  try {
    const countryCodes = await listRegions().then((regions) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat(),
    )

    if (!countryCodes) {
      return []
    }

    const promises = countryCodes.map(async (country) => {
      const { response } = await listProducts({
        countryCode: country,
        queryParams: { limit: 100, fields: "handle" },
      })

      return {
        country,
        products: response.products,
      }
    })

    const countryProducts = await Promise.all(promises)

    return countryProducts
      .flatMap((countryData) =>
        countryData.products.map((product) => ({
          countryCode: countryData.country,
          handle: product.handle,
        })),
      )
      .filter((param) => param.handle)
  } catch (error) {
    console.error(
      `Failed to generate static paths for product pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }.`,
    )
    return []
  }
}

function getImagesForVariant(
  product: HttpTypes.StoreProduct,
  selectedVariantId?: string,
) {
  if (!selectedVariantId || !product.variants) {
    return product.images
  }

  const variant = product.variants!.find((v) => v.id === selectedVariantId)
  if (!variant || !variant.images?.length) {
    return product.images
  }

  const imageIdsMap = new Map(variant.images!.map((i) => [i.id, true]))
  return product.images?.filter((i) => imageIdsMap.has(i.id)) ?? null
}

function getAbsolutePayloadUrl(url?: string) {
  if (!url) {
    return undefined
  }

  if (url.startsWith("http")) {
    return url
  }

  const payloadUrl = getPayloadServerUrl()

  return `${payloadUrl}${url.startsWith("/") ? "" : "/"}${url}`
}

function getAbsoluteStorefrontUrl(pathOrUrl: string) {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl
  }

  return new URL(pathOrUrl, getBaseURL()).toString()
}

function getVariantAvailability(variant: HttpTypes.StoreProductVariant) {
  if (!variant.manage_inventory) {
    return "https://schema.org/InStock"
  }

  if ((variant.inventory_quantity ?? 0) > 0) {
    return "https://schema.org/InStock"
  }

  return variant.allow_backorder
    ? "https://schema.org/BackOrder"
    : "https://schema.org/OutOfStock"
}

function getProductSchema({
  product,
  countryCode,
  selectedVariantId,
}: {
  product: HttpTypes.StoreProduct
  countryCode: string
  selectedVariantId?: string
}) {
  const productUrl = getAbsoluteStorefrontUrl(
    `/${countryCode}/products/${product.handle}`,
  )
  const selectedVariant = selectedVariantId
    ? product.variants?.find((variant) => variant.id === selectedVariantId)
    : undefined
  const schemaVariants = selectedVariant
    ? [selectedVariant]
    : (product.variants ?? [])
  const offers = schemaVariants.flatMap((variant) => {
    const calculatedPrice = variant.calculated_price

    if (
      calculatedPrice?.calculated_amount === undefined ||
      !calculatedPrice.currency_code
    ) {
      return []
    }

    return [
      {
        "@type": "Offer",
        url: `${productUrl}?v_id=${encodeURIComponent(variant.id)}`,
        sku: variant.sku || variant.id,
        price: calculatedPrice.calculated_amount,
        priceCurrency: calculatedPrice.currency_code.toUpperCase(),
        availability: getVariantAvailability(variant),
        itemCondition: "https://schema.org/NewCondition",
        seller: {
          "@type": "Organization",
          name: "PetBoxNest",
        },
      },
    ]
  })
  const primaryVariant = selectedVariant || product.variants?.[0]
  const imageUrls = Array.from(
    new Set(
      [product.thumbnail, ...(product.images?.map((image) => image.url) ?? [])]
        .filter((image): image is string => Boolean(image))
        .map(getAbsoluteStorefrontUrl),
    ),
  )

  return {
    schemaId: `${productUrl}#product`,
    schema: {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${productUrl}#product`,
      name: product.title,
      description: product.description || product.subtitle || product.title,
      url: productUrl,
      ...(imageUrls.length ? { image: imageUrls } : {}),
      sku: primaryVariant?.sku || primaryVariant?.id || product.id,
      brand: {
        "@type": "Brand",
        name: "PetBoxNest",
      },
      ...(offers.length
        ? { offers: offers.length === 1 ? offers[0] : offers }
        : {}),
    },
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle } = params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const product = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle },
  }).then(({ response }) => response.products[0])

  if (!product) {
    notFound()
  }

  const enhancement = await getProductEnhancement({
    productHandle: handle,
    productId: product.id,
  })

  const title = enhancement?.seo?.meta_title || `${product.title} | Petboxnest`
  const description =
    enhancement?.seo?.meta_description ||
    product.description ||
    `${product.title} from Petboxnest.`
  const ogImage =
    getAbsolutePayloadUrl(enhancement?.seo?.og_image?.url) ||
    product.thumbnail ||
    undefined

  return {
    title,
    description,
    alternates: {
      canonical: `/${params.countryCode}/products/${handle}`,
    },
    openGraph: {
      title,
      description,
      url: `/${params.countryCode}/products/${handle}`,
      images: ogImage ? [ogImage] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : ["/twitter-image.jpg"],
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)
  const searchParams = await props.searchParams

  const selectedVariantId = searchParams.v_id

  if (!region) {
    notFound()
  }

  const pricedProduct = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle: params.handle },
    cache: "force-cache",
  }).then(({ response }) => response.products[0])

  if (!pricedProduct) {
    notFound()
  }

  const images = getImagesForVariant(pricedProduct, selectedVariantId)
  const enhancement = await getProductEnhancement({
    productHandle: params.handle,
    productId: pricedProduct.id,
  })
  const { schemaId, schema } = getProductSchema({
    product: pricedProduct,
    countryCode: params.countryCode,
    selectedVariantId,
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={params.countryCode}
        images={images ?? []}
        enhancement={enhancement}
        productSchemaId={schemaId}
        reviewQuery={{
          page: Math.max(1, Number(searchParams.review_page) || 1),
          rating: searchParams.review_rating
            ? Number(searchParams.review_rating)
            : undefined,
          q: searchParams.review_q,
          sort: searchParams.review_sort,
        }}
      />
    </>
  )
}
