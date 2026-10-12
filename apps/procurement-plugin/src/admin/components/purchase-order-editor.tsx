import { Plus, Spinner, Trash } from "@medusajs/icons"
import {
  Button,
  FocusModal,
  Input,
  Label,
  Select,
  Table,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { sdk } from "../lib/sdk"
import type {
  PurchaseOrderFormItem,
  PurchaseOrderFormValue,
  SupplierListResponse,
} from "../types"

type ProductVariant = {
  id: string
  title: string
  sku: string | null
}

type Product = {
  id: string
  title: string
  thumbnail: string | null
  variants?: ProductVariant[]
}

const blankItem = (): PurchaseOrderFormItem => ({
  product_id: null,
  variant_id: null,
  sku: "",
  product_title: "",
  variant_title: "",
  supplier_sku: "",
  supplier_url: "",
  quantity: 1,
  unit_cost: 0,
  notes: "",
})

const initialValue = (): PurchaseOrderFormValue => ({
  supplier_id: "",
  currency_code: "usd",
  base_currency_code: "usd",
  exchange_rate: 1,
  shipping_amount: 0,
  tax_amount: 0,
  discount_amount: 0,
  other_amount: 0,
  ordered_at: "",
  expected_at: "",
  notes: "",
  items: [],
})

type Props = { open: boolean; onOpenChange: (open: boolean) => void }

export const PurchaseOrderEditor = ({ open, onOpenChange }: Props) => {
  const queryClient = useQueryClient()
  const [value, setValue] = useState<PurchaseOrderFormValue>(initialValue)
  const [productSearch, setProductSearch] = useState("")
  const [query, setQuery] = useState("")
  const [productPage, setProductPage] = useState(0)
  const productLimit = 10

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(productSearch.trim())
      setProductPage(0)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [productSearch])

  const suppliers = useQuery({
    queryKey: ["procurement-suppliers-for-order"],
    queryFn: () =>
      sdk.client.fetch<SupplierListResponse>("/admin/procurement/suppliers", {
        query: { page: 1, limit: 100, status: "active" },
      }),
    enabled: open,
  })
  const products = useQuery({
    queryKey: ["procurement-product-picker", query, productPage],
    queryFn: async () => {
      const response = await sdk.admin.product.list({
        q: query || undefined,
        limit: productLimit,
        offset: productPage * productLimit,
        fields: "+variants.*",
      })
      return response as unknown as { products: Product[]; count: number }
    },
    enabled: open,
  })

  const subtotal = useMemo(
    () => value.items.reduce((sum, item) => sum + item.quantity * item.unit_cost, 0),
    [value.items]
  )
  const total =
    subtotal + value.shipping_amount + value.tax_amount + value.other_amount - value.discount_amount

  const save = useMutation({
    mutationFn: () =>
      sdk.client.fetch("/admin/procurement/orders", {
        method: "POST",
        body: {
          ...value,
          ordered_at: value.ordered_at || null,
          expected_at: value.expected_at || null,
        },
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["procurement-orders"] }),
        queryClient.invalidateQueries({ queryKey: ["procurement-analytics"] }),
      ])
      toast.success("采购单已创建 / Purchase order created")
      setValue(initialValue())
      onOpenChange(false)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const addProduct = (product: Product, variant?: ProductVariant) => {
    setValue((current) => ({
      ...current,
      items: [
        ...current.items,
        {
          ...blankItem(),
          product_id: product.id,
          variant_id: variant?.id || null,
          sku: variant?.sku || "",
          product_title: product.title,
          variant_title: variant?.title || "",
        },
      ],
    }))
  }

  const updateItem = <K extends keyof PurchaseOrderFormItem>(
    index: number,
    key: K,
    next: PurchaseOrderFormItem[K]
  ) => {
    setValue((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: next } : item
      ),
    }))
  }

  const submit = () => {
    if (!value.supplier_id) return toast.error("请选择供应商 / Select a supplier")
    if (!value.items.length) return toast.error("请至少添加一项商品 / Add at least one item")
    if (value.items.some((item) => !item.product_title.trim())) {
      return toast.error("商品标题不能为空 / Item title is required")
    }
    save.mutate()
  }

  return (
    <FocusModal open={open} onOpenChange={onOpenChange}>
      <FocusModal.Content>
        <div className="flex h-full flex-col overflow-hidden">
          <FocusModal.Header>
            <div className="flex w-full items-center justify-between">
              <div>
                <Text weight="plus">新建采购单</Text>
                <Text size="small" className="text-ui-fg-subtle">Create purchase order</Text>
              </div>
              <div className="flex gap-2">
                <FocusModal.Close asChild>
                  <Button size="small" variant="secondary" disabled={save.isPending}>取消</Button>
                </FocusModal.Close>
                <Button size="small" onClick={submit} isLoading={save.isPending}>保存草稿 / Save draft</Button>
              </div>
            </div>
          </FocusModal.Header>
          <FocusModal.Body className="overflow-y-auto">
            <div className="mx-auto grid w-full max-w-6xl gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="flex flex-col gap-6">
                <section className="shadow-elevation-card-rest bg-ui-bg-base rounded-lg p-6">
                  <Text size="small" weight="plus">基本信息 / General</Text>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label>供应商 / Supplier</Label>
                      <Select value={value.supplier_id} onValueChange={(supplier_id) => setValue((current) => ({ ...current, supplier_id }))}>
                        <Select.Trigger><Select.Value placeholder="选择供应商" /></Select.Trigger>
                        <Select.Content>
                          {(suppliers.data?.suppliers || []).map((supplier) => (
                            <Select.Item key={supplier.id} value={supplier.id}>{supplier.name}</Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>币种 / Currency</Label>
                      <Input value={value.currency_code} maxLength={3} onChange={(event) => setValue((current) => ({ ...current, currency_code: event.target.value.toLowerCase() }))} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>换算至 USD 汇率 / Exchange rate</Label>
                      <Input type="number" min="0.0001" step="0.0001" value={value.exchange_rate} onChange={(event) => setValue((current) => ({ ...current, exchange_rate: Number(event.target.value) }))} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>预计到货 / Expected date</Label>
                      <Input type="date" value={value.expected_at} onChange={(event) => setValue((current) => ({ ...current, expected_at: event.target.value }))} />
                    </div>
                  </div>
                </section>

                <section className="shadow-elevation-card-rest bg-ui-bg-base rounded-lg p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div><Text size="small" weight="plus">采购明细 / Items</Text><Text size="small" className="text-ui-fg-subtle">搜索 Medusa 商品或添加手工项目</Text></div>
                    <Button size="small" variant="secondary" onClick={() => setValue((current) => ({ ...current, items: [...current.items, blankItem()] }))}><Plus /> 手工项目</Button>
                  </div>
                  <div className="mt-4 rounded-lg border">
                    <div className="border-b p-3"><Input placeholder="搜索商品 / Search products" value={productSearch} onChange={(event) => setProductSearch(event.target.value)} /></div>
                    {products.isLoading ? <div className="flex justify-center p-6"><Spinner /></div> : (
                      <div className="max-h-64 overflow-y-auto">
                        {(products.data?.products || []).map((product) => (
                          <div key={product.id} className="border-b p-3 last:border-b-0">
                            <Text size="small" weight="plus">{product.title}</Text>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {(product.variants?.length ? product.variants : [undefined]).map((variant) => (
                                <Button key={variant?.id || product.id} size="small" variant="secondary" onClick={() => addProduct(product, variant)}><Plus /> {variant?.title || "Default"}{variant?.sku ? ` · ${variant.sku}` : ""}</Button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between p-3">
                      <Button size="small" variant="secondary" disabled={productPage === 0} onClick={() => setProductPage((page) => page - 1)}>上一页</Button>
                      <Text size="small">第 {productPage + 1} 页</Text>
                      <Button size="small" variant="secondary" disabled={(products.data?.products.length || 0) < productLimit} onClick={() => setProductPage((page) => page + 1)}>下一页</Button>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3">
                    {value.items.map((item, index) => (
                      <div key={`${item.variant_id || "manual"}-${index}`} className="shadow-elevation-card-rest rounded-lg p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="grid flex-1 gap-3 sm:grid-cols-2">
                            <div className="flex flex-col gap-2"><Label>商品标题 / Item</Label><Input value={item.product_title} onChange={(event) => updateItem(index, "product_title", event.target.value)} /></div>
                            <div className="flex flex-col gap-2"><Label>SKU</Label><Input value={item.sku} onChange={(event) => updateItem(index, "sku", event.target.value)} /></div>
                            <div className="flex flex-col gap-2"><Label>数量 / Quantity</Label><Input type="number" min="1" value={item.quantity} onChange={(event) => updateItem(index, "quantity", Number(event.target.value))} /></div>
                            <div className="flex flex-col gap-2"><Label>单位成本 / Unit cost</Label><Input type="number" min="0" step="0.0001" value={item.unit_cost} onChange={(event) => updateItem(index, "unit_cost", Number(event.target.value))} /></div>
                            <div className="flex flex-col gap-2 sm:col-span-2"><Label>供应商商品地址 / Supplier URL</Label><Input value={item.supplier_url} onChange={(event) => updateItem(index, "supplier_url", event.target.value)} /></div>
                          </div>
                          <Button size="small" variant="transparent" onClick={() => setValue((current) => ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) }))}><Trash /></Button>
                        </div>
                      </div>
                    ))}
                    {!value.items.length && <Text size="small" className="text-ui-fg-subtle text-center py-6">尚未添加采购项目 / No items added</Text>}
                  </div>
                </section>
              </div>

              <div className="flex flex-col gap-4">
                <section className="shadow-elevation-card-rest bg-ui-bg-base rounded-lg p-6">
                  <Text size="small" weight="plus">费用 / Costs</Text>
                  {([['shipping_amount', '运费 / Shipping'], ['tax_amount', '税费 / Tax'], ['discount_amount', '优惠 / Discount'], ['other_amount', '其他 / Other']] as const).map(([key, label]) => (
                    <div className="mt-3 flex flex-col gap-2" key={key}><Label>{label}</Label><Input type="number" min="0" step="0.0001" value={value[key]} onChange={(event) => setValue((current) => ({ ...current, [key]: Number(event.target.value) }))} /></div>
                  ))}
                  <div className="mt-5 border-t pt-4">
                    <div className="flex justify-between"><Text size="small">小计 / Subtotal</Text><Text size="small">{subtotal.toFixed(2)} {value.currency_code.toUpperCase()}</Text></div>
                    <div className="mt-2 flex justify-between"><Text weight="plus">总额 / Total</Text><Text weight="plus">{total.toFixed(2)} {value.currency_code.toUpperCase()}</Text></div>
                  </div>
                </section>
                <section className="shadow-elevation-card-rest bg-ui-bg-base rounded-lg p-6">
                  <div className="flex flex-col gap-2"><Label>备注 / Notes</Label><Textarea value={value.notes} onChange={(event) => setValue((current) => ({ ...current, notes: event.target.value }))} /></div>
                </section>
              </div>
            </div>
          </FocusModal.Body>
        </div>
      </FocusModal.Content>
    </FocusModal>
  )
}
