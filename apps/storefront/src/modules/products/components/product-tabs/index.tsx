"use client"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "Product Information",
      component: <ProductInfoTab product={product} />,
    },
    // {
    //   label: "Shipping & Returns",
    //   component: <ShippingInfoTab />,
    // },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="pb-5 pt-2 text-sm leading-6">
      <div className="grid grid-cols-2 gap-5">
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-bold text-ink">Material</span>
            <p className="text-muted">
              {product.material ? product.material : "-"}
            </p>
          </div>
          <div>
            <span className="font-bold text-ink">Country of origin</span>
            <p className="text-muted">
              {product.origin_country ? product.origin_country : "-"}
            </p>
          </div>
          <div>
            <span className="font-bold text-ink">Type</span>
            <p className="text-muted">
              {product.type ? product.type.value : "-"}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-bold text-ink">Weight</span>
            <p className="text-muted">
              {product.weight ? `${product.weight} g` : "-"}
            </p>
          </div>
          <div>
            <span className="font-bold text-ink">Dimensions</span>
            <p className="text-muted">
              {product.length && product.width && product.height
                ? `${product.length}L x ${product.width}W x ${product.height}H`
                : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
