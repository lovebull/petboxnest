import repeat from "@lib/util/repeat"
import { clx } from "@modules/common/components/ui"
import SkeletonProductPreview from "@modules/skeletons/components/skeleton-product-preview"

const SkeletonProductGrid = ({
  numberOfProducts = 8,
  productLayout = "default",
}: {
  numberOfProducts?: number
  productLayout?: "default" | "best-sellers"
}) => {
  return (
    <ul
      className={clx(
        "grid flex-1 grid-cols-2 gap-x-4 small:gap-x-6",
        productLayout === "best-sellers"
          ? "gap-y-9 small:grid-cols-2 medium:grid-cols-[repeat(3,minmax(0,286px))] medium:justify-start"
          : "gap-y-8 small:grid-cols-3 medium:grid-cols-4"
      )}
      data-testid="products-list-loader"
    >
      {repeat(numberOfProducts).map((index) => (
        <li key={index}>
          <SkeletonProductPreview
            isFeatured={productLayout === "best-sellers"}
          />
        </li>
      ))}
    </ul>
  )
}

export default SkeletonProductGrid
