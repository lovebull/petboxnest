import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info">
      <div className="flex flex-col">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="pbn-focus mb-4 inline-flex w-fit items-center gap-2 rounded-base text-xs font-bold uppercase tracking-[0.14em] text-brand hover:text-brand-dark"
          >
            <span aria-hidden="true">←</span>
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <Heading
          level="h1"
          className="font-display text-[34px] font-bold leading-[1.08] tracking-[-0.03em] text-ink xsmall:text-[42px]"
          data-testid="product-title"
        >
          {product.title}
        </Heading>

        {product.subtitle && (
          <p className="mt-4 text-base font-semibold leading-6 text-ink">
            {product.subtitle}
          </p>
        )}

        <Text
          className="mt-4 whitespace-pre-line text-sm leading-6 text-muted xsmall:text-base"
          data-testid="product-description"
        >
          {product.description}
        </Text>
      </div>
    </div>
  )
}

export default ProductInfo
