"use client"

import type { TextFieldClientComponent } from "payload"

import { useField } from "@payloadcms/ui"
import { useCallback, useMemo, useState } from "react"

type MedusaProduct = {
  handle: string
  id: string
  status?: string
  title: string
}

type ProductsResponse = {
  error?: string
  products?: MedusaProduct[]
}

export const MedusaProductPicker: TextFieldClientComponent = ({ path }) => {
  const productIDField = useField<string>({
    path: path || "medusa_product_id",
  })
  const productHandleField = useField<string>({
    path: "medusa_product_handle",
  })
  const [products, setProducts] = useState<MedusaProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productIDField.value),
    [productIDField.value, products]
  )

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/medusa/products", {
        cache: "no-store",
      })
      const data = (await response.json()) as ProductsResponse

      if (!response.ok) {
        throw new Error(data.error || "Unable to fetch Medusa products.")
      }

      setProducts(data.products || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.")
    } finally {
      setLoading(false)
    }
  }, [])

  const selectProduct = useCallback(
    (productID: string) => {
      const product = products.find((item) => item.id === productID)

      productIDField.setValue(productID)

      if (product?.handle) {
        productHandleField.setValue(product.handle)
      }
    },
    [productHandleField, productIDField, products]
  )

  return (
    <div
      className="field-type text"
      style={{
        display: "grid",
        gap: "10px",
        marginBottom: "var(--base)",
      }}
    >
      <label
        className="field-label"
        htmlFor={productIDField.path}
        style={{ marginBottom: 0 }}
      >
        <span>Medusa 产品 ID</span>
        <span
          style={{
            color: "var(--theme-elevation-600)",
            display: "block",
            fontSize: "12px",
            fontWeight: 400,
            lineHeight: "18px",
          }}
        >
          Medusa Product ID
        </span>
      </label>

      <input
        id={productIDField.path}
        name={productIDField.path}
        onChange={(event) => productIDField.setValue(event.target.value)}
        placeholder="prod_01..."
        type="text"
        value={productIDField.value || ""}
      />

      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <button
          className="btn btn--style-secondary btn--size-small"
          disabled={loading}
          onClick={fetchProducts}
          type="button"
        >
          {loading
            ? "正在获取 / Loading..."
            : "获取已发布产品 / Fetch published products"}
        </button>

        {products.length > 0 && (
          <select
            aria-label="选择 Medusa 已发布产品 / Select published Medusa product"
            onChange={(event) => selectProduct(event.target.value)}
            value={selectedProduct?.id || ""}
          >
            <option value="">选择产品 / Select product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.title} - {product.id}
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedProduct && (
        <p style={{ margin: 0 }}>
          已选择：{selectedProduct.title} / Selected: {selectedProduct.handle}
        </p>
      )}

      {error && (
        <p style={{ color: "var(--theme-error-500)", margin: 0 }}>
          获取失败：{error} / Fetch failed.
        </p>
      )}

      <p
        style={{
          color: "var(--theme-elevation-600)",
          fontSize: "12px",
          lineHeight: "18px",
          margin: 0,
        }}
      >
        从 Medusa 已发布产品中选择，选择后会自动填入产品 ID，并同步产品
        handle。
        <br />
        Select a published Medusa product. The product ID and handle will be
        filled automatically.
      </p>
    </div>
  )
}
