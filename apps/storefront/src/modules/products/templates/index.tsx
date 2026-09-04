import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductEnhancement from "@modules/products/components/product-enhancement"
import ProductTabs from "@modules/products/components/product-tabs"
import ProductReviews from "@modules/products/components/product-reviews"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { ProductEnhancement as ProductEnhancementType } from "@lib/data/payload-product-enhancements"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { CheckCircle, ShieldCheck, TruckFast } from "@medusajs/icons"

import ProductActionsWrapper from "./product-actions-wrapper"
import type { ProductReviewsResponse } from "@lib/data/product-reviews"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
  enhancement: ProductEnhancementType | null
  reviews: ProductReviewsResponse
  canReview: boolean
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
  enhancement,
  reviews,
  canReview,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <>
      <section
        className="border-b border-grey-20 bg-cream"
        data-testid="product-container"
      >
        <div className="pbn-container py-6 xsmall:py-8 small:py-14">
          <div className="grid items-start gap-8 small:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.85fr)] small:gap-12">
            <ImageGallery images={images} productTitle={product.title} />

            <div className="small:sticky small:top-28">
              <div className="rounded-[24px] border border-grey-20 bg-white p-5 shadow-[0_16px_40px_rgba(32,36,51,0.08)] xsmall:p-7 small:p-8">
                <ProductInfo product={product} />

                <div className="my-6 h-px bg-grey-20" />

                <div className="flex flex-col gap-6">
                  <ProductOnboardingCta />
                  <Suspense
                    fallback={
                      <ProductActions
                        disabled={true}
                        product={product}
                        region={region}
                      />
                    }
                  >
                    <ProductActionsWrapper id={product.id} region={region} />
                  </Suspense>
                </div>

                <div
                  className="mt-6 grid gap-2 border-t border-grey-20 pt-6 xsmall:grid-cols-3 small:grid-cols-1 medium:grid-cols-3"
                  aria-label="Shopping reassurance"
                >
                  <TrustLink
                    href="/shipping-policy"
                    icon={<TruckFast aria-hidden="true" />}
                    label="Shipping details"
                  />
                  <TrustLink
                    href="/refund-policy"
                    icon={<CheckCircle aria-hidden="true" />}
                    label="Clear returns"
                  />
                  <TrustItem
                    icon={<ShieldCheck aria-hidden="true" />}
                    label="Secure checkout"
                  />
                </div>

                <div className="mt-6">
                  <ProductTabs product={product} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ProductEnhancement enhancement={enhancement} />
      <ProductReviews productId={product.id} data={reviews} canReview={canReview} />
      <section
        className="border-t border-grey-20 bg-mist py-16 small:py-24"
        data-testid="related-products-container"
      >
        <div className="pbn-container">
          <Suspense fallback={<SkeletonRelatedProducts />}>
            <RelatedProducts product={product} countryCode={countryCode} />
          </Suspense>
        </div>
      </section>
    </>
  )
}

const trustClassName =
  "pbn-focus flex min-h-12 items-center gap-3 rounded-[14px] bg-mist px-3 py-2.5 text-left text-xs font-semibold leading-4 text-ink transition-colors hover:bg-mint/50"

function TrustLink({
  href,
  icon,
  label,
}: {
  href: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <LocalizedClientLink href={href} className={trustClassName}>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-white text-brand">
        {icon}
      </span>
      <span>{label}</span>
    </LocalizedClientLink>
  )
}

function TrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className={trustClassName}>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-white text-brand">
        {icon}
      </span>
      <span>{label}</span>
    </div>
  )
}

export default ProductTemplate
