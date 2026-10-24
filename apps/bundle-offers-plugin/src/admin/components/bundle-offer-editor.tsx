import {
  Button,
  Drawer,
  Heading,
  Input,
  Label,
  Select,
  Text,
  toast,
} from "@medusajs/ui"
import { Plus, Trash } from "@medusajs/icons"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FormEvent, useEffect, useMemo, useState } from "react"
import { sdk } from "../lib/sdk"
import { getPackInventoryError, hasDuplicateInventoryItems } from "../../utils/inventory-safety"
import type {
  AdminBundleComponent,
  AdminBundleOffer,
  AdminBundleOption,
} from "../types"

type ProductSummary = {
  id: string
  title: string
  variants?: Array<{
    id: string; title: string; sku?: string | null
    metadata?: Record<string, unknown> | null
    inventory_items?: Array<{ inventory_item_id: string; required_quantity: number }>
  }>
}

type InventorySummary = {
  id: string
  title: string
  sku?: string | null
}

type EditorProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  offer: AdminBundleOffer | null
  initialProductId?: string
}

type Draft = {
  product_id: string
  title: string
  subtitle: string
  status: "draft" | "active" | "archived"
  starts_at: string
  ends_at: string
  options: Array<AdminBundleOption & {
    compare_currency: string
    compare_value: string
  }>
}

const emptyComponent = (): AdminBundleComponent => ({
  inventory_item_id: "",
  required_quantity: 1,
  role: "paid",
  label: "",
  display_order: 0,
})

const emptyOption = (order: number): Draft["options"][number] => ({
  variant_id: "",
  title: "",
  subtitle: "",
  badge: "",
  gift_label: "",
  compare_at_prices: null,
  compare_currency: "usd",
  compare_value: "",
  display_order: order,
  is_default: order === 0,
  is_active: true,
  components: [],
})

const makeDraft = (
  offer: AdminBundleOffer | null,
  initialProductId?: string
): Draft => {
  if (!offer) {
    return {
      product_id: initialProductId || "",
      title: "Choose your supply",
      subtitle: "Pick the option that fits your home and routine.",
      status: "draft",
      starts_at: "",
      ends_at: "",
      options: [emptyOption(0)],
    }
  }

  return {
    product_id: offer.product_id,
    title: offer.title,
    subtitle: offer.subtitle || "",
    status: offer.status,
    starts_at: offer.starts_at?.slice(0, 16) || "",
    ends_at: offer.ends_at?.slice(0, 16) || "",
    options: offer.options.map((option) => {
      const [currency, value] = Object.entries(option.compare_at_prices || {})[0] || ["usd", ""]
      return {
        ...option,
        subtitle: option.subtitle || "",
        badge: option.badge || "",
        gift_label: option.gift_label || "",
        compare_currency: currency,
        compare_value: String(value),
        components: option.components.map((component) => ({
          ...component,
          label: component.label || "",
        })),
      }
    }),
  }
}

export function BundleOfferEditor({
  open,
  onOpenChange,
  offer,
  initialProductId,
}: EditorProps) {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<Draft>(() => makeDraft(offer, initialProductId))

  useEffect(() => {
    if (open) {
      setDraft(makeDraft(offer, initialProductId))
    }
  }, [open, offer, initialProductId])

  const productsQuery = useQuery({
    queryKey: ["bundle-offers-products"],
    queryFn: async () => {
      const response = await sdk.admin.product.list({ limit: 100 })
      return response.products as ProductSummary[]
    },
    enabled: open,
  })
  const selectedProductQuery = useQuery({
    queryKey: ["bundle-offers-product", draft.product_id],
    queryFn: async () => {
      const response = await sdk.admin.product.retrieve(draft.product_id, {
        fields: "+variants.id,+variants.title,+variants.sku,+variants.metadata,*variants.inventory_items",
      })
      return response.product as ProductSummary
    },
    enabled: open && Boolean(draft.product_id),
  })
  const inventoryQuery = useQuery({
    queryKey: ["bundle-offers-inventory-items"],
    queryFn: async () => {
      const response = await sdk.admin.inventoryItem.list({ limit: 100 })
      return response.inventory_items as InventorySummary[]
    },
    enabled: open,
  })

  const variants = selectedProductQuery.data?.variants || []
  const usedVariantIds = new Set(draft.options.map((option) => option.variant_id).filter(Boolean))
  const hasUnusedVariant = variants.some((variant) => !usedVariantIds.has(variant.id))
  const inventoryItems = inventoryQuery.data || []
  const invalidReason = useMemo(() => {
    if (!draft.product_id) return "请选择商品 / Select a product"
    if (selectedProductQuery.isPending || selectedProductQuery.isError) return "请等待商品库存配置加载成功 / Product inventory must load before saving"
    if (!draft.title.trim()) return "请输入套餐标题 / Enter an offer title"
    if (!draft.options.length) return "至少添加一个套餐 / Add at least one option"
    if (draft.options.some((option) => !option.variant_id || !option.title.trim())) {
      return "每个套餐都需要变体和标题 / Every option needs a variant and title"
    }
    if (new Set(draft.options.map((option) => option.variant_id)).size !== draft.options.length) {
      return "多个套餐绑定了相同变体，请为每个套餐选择独立变体 / Select a different variant for each option"
    }
    if (draft.options.filter((option) => option.is_active && option.is_default).length > 1) {
      return "只能设置一个默认套餐 / Only one active option can be default"
    }
    if (draft.options.some((option) => option.components.some((component) => !component.inventory_item_id))) {
      return "请选择库存组件 / Select every inventory component"
    }
    for (const option of draft.options) {
      const variant = variants.find((item) => item.id === option.variant_id)
      if (!variant) return "绑定变体不存在，请刷新 / Variant not found; refresh this editor"
      if (hasDuplicateInventoryItems(option.components)) return "相同库存项请合并填写总数量（含赠品） / Combine quantities for the same inventory item"
      if (option.components.some((item) => !Number.isInteger(item.required_quantity) || item.required_quantity < 1)) return "库存数量必须是正整数 / Inventory quantities must be positive integers"
      const error = getPackInventoryError(variant.metadata, variant.inventory_items || [], option.components)
      if (error) return error
    }
    return null
  }, [draft, selectedProductQuery.data, selectedProductQuery.isPending, selectedProductQuery.isError])

  const save = useMutation({
    mutationFn: () => {
      const body = {
        product_id: draft.product_id,
        title: draft.title.trim(),
        subtitle: draft.subtitle.trim() || null,
        status: draft.status,
        starts_at: draft.starts_at ? new Date(draft.starts_at).toISOString() : null,
        ends_at: draft.ends_at ? new Date(draft.ends_at).toISOString() : null,
        options: draft.options.map((option, optionIndex) => ({
          variant_id: option.variant_id,
          title: option.title.trim(),
          subtitle: option.subtitle?.trim() || null,
          badge: option.badge?.trim() || null,
          gift_label: option.gift_label?.trim() || null,
          compare_at_prices:
            option.compare_value && Number(option.compare_value) >= 0
              ? { [option.compare_currency.toLowerCase()]: Number(option.compare_value) }
              : null,
          display_order: optionIndex,
          is_default: option.is_default,
          is_active: option.is_active,
          components: option.components.map((component, componentIndex) => ({
            inventory_item_id: component.inventory_item_id,
            required_quantity: Number(component.required_quantity),
            role: component.role,
            label: component.label?.trim() || null,
            display_order: componentIndex,
          })),
        })),
      }
      return sdk.client.fetch(
        offer ? `/admin/bundle-offers/${offer.id}` : "/admin/bundle-offers",
        { method: "POST", body }
      )
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["bundle-offers"] })
      await queryClient.invalidateQueries({ queryKey: ["bundle-offers-product", draft.product_id] })
      await queryClient.invalidateQueries({ queryKey: ["product", draft.product_id] })
      toast.success("套餐已保存 / Bundle offer saved")
      onOpenChange(false)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const updateOption = (index: number, values: Partial<Draft["options"][number]>) => {
    setDraft((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) =>
        optionIndex === index ? { ...option, ...values } : option
      ),
    }))
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content className="max-w-3xl">
        <form
          className="flex h-full flex-col"
          onSubmit={(event: FormEvent) => {
            event.preventDefault()
            if (!invalidReason) save.mutate()
          }}
        >
          <Drawer.Header>
            <Drawer.Title>{offer ? "编辑套餐 / Edit bundle offer" : "新建套餐 / New bundle offer"}</Drawer.Title>
            <Drawer.Description>
              展示配置绑定商品变体；成交价仍由 Medusa Pricing 决定。
              <br />Display configuration binds to purchasable variants; Medusa Pricing remains the price source.
            </Drawer.Description>
          </Drawer.Header>
          <Drawer.Body className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-col gap-6">
              <section className="grid gap-4 sm:grid-cols-2">
                <Field label="商品 / Product">
                  <Select
                    value={draft.product_id || undefined}
                    onValueChange={(product_id) =>
                      setDraft((current) => ({ ...current, product_id, options: [emptyOption(0)] }))
                    }
                    disabled={Boolean(offer)}
                  >
                    <Select.Trigger><Select.Value placeholder="选择商品 / Select product" /></Select.Trigger>
                    <Select.Content>
                      {(productsQuery.data || []).map((product) => (
                        <Select.Item key={product.id} value={product.id}>{product.title}</Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </Field>
                <Field label="状态 / Status">
                  <Select value={draft.status} onValueChange={(status) => setDraft((current) => ({ ...current, status: status as Draft["status"] }))}>
                    <Select.Trigger><Select.Value /></Select.Trigger>
                    <Select.Content>
                      <Select.Item value="draft">草稿 / Draft</Select.Item>
                      <Select.Item value="active">启用 / Active</Select.Item>
                      <Select.Item value="archived">归档 / Archived</Select.Item>
                    </Select.Content>
                  </Select>
                </Field>
                <Field label="区块标题 / Section title">
                  <Input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} />
                </Field>
                <Field label="区块说明 / Supporting copy">
                  <Input value={draft.subtitle} onChange={(event) => setDraft((current) => ({ ...current, subtitle: event.target.value }))} />
                </Field>
                <Field label="开始时间 / Starts at">
                  <Input type="datetime-local" value={draft.starts_at} onChange={(event) => setDraft((current) => ({ ...current, starts_at: event.target.value }))} />
                </Field>
                <Field label="结束时间 / Ends at">
                  <Input type="datetime-local" value={draft.ends_at} onChange={(event) => setDraft((current) => ({ ...current, ends_at: event.target.value }))} />
                </Field>
              </section>

              <div className="flex items-center justify-between">
                <div>
                  <Heading level="h2">套餐选项</Heading>
                  <Text size="small" className="text-ui-fg-subtle">Bundle options</Text>
                </div>
                <Button type="button" size="small" variant="secondary" disabled={selectedProductQuery.isFetching || !hasUnusedVariant || draft.options.some((option) => !option.variant_id)} onClick={() => setDraft((current) => ({ ...current, options: [...current.options, emptyOption(current.options.length)] }))}>
                  <Plus /> 添加套餐 / Add option
                </Button>
              </div>

              <Text size="small" className="text-ui-fg-subtle">
                每个套餐需要独立的商品变体，用于设置成交价及库存组成。多个套餐可以通过库存组件复用同一库存项。
                <br />Each option requires its own purchasable variant. Options can share inventory items through kit components.
                {draft.product_id && !selectedProductQuery.isFetching && !hasUnusedVariant && (
                  <>
                    <br />当前没有未绑定的变体，请先到商品详情创建新的套餐变体，再返回编辑。
                    <br />No unused variants remain. Create another variant on the product details page, then return to this editor.
                    <br /><a href={`/app/products/${draft.product_id}`} target="_blank" rel="noreferrer" className="underline">打开商品详情 / Open product details</a>
                  </>
                )}
              </Text>

              {draft.options.map((option, optionIndex) => (
                <section key={option.id || `option-${optionIndex}`} className="rounded-lg border border-ui-border-base p-4">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <Heading level="h3">套餐 {optionIndex + 1} / Option {optionIndex + 1}</Heading>
                      <Text size="xsmall" className="text-ui-fg-subtle">顾客选择此卡片后，购物车加入绑定变体。</Text>
                    </div>
                    <Button type="button" size="small" variant="transparent" disabled={draft.options.length === 1} onClick={() => setDraft((current) => ({ ...current, options: current.options.filter((_, index) => index !== optionIndex) }))}>
                      <Trash /> 删除 / Remove
                    </Button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="绑定变体 / Purchasable variant">
                      <Select value={option.variant_id || undefined} onValueChange={(variant_id) => {
                        const variant = variants.find((item) => item.id === variant_id)
                        if (variant_id === option.variant_id) return
                        updateOption(optionIndex, {
                          variant_id, title: option.title || variant?.title || "",
                          components: (variant?.inventory_items || []).map((item, index) => ({
                            inventory_item_id: item.inventory_item_id,
                            required_quantity: item.required_quantity,
                            role: "paid" as const, label: "", display_order: index,
                          })),
                        })
                      }}>
                        <Select.Trigger><Select.Value placeholder="选择变体 / Select variant" /></Select.Trigger>
                        <Select.Content>{variants.map((variant) => {
                          const usedByOtherOption = draft.options.some((other, index) => index !== optionIndex && other.variant_id === variant.id)
                          return <Select.Item key={variant.id} value={variant.id} disabled={usedByOtherOption}>{variant.title}{variant.sku ? ` · ${variant.sku}` : ""}{usedByOtherOption ? " · 已绑定其他套餐 / Already assigned" : ""}</Select.Item>
                        })}</Select.Content>
                      </Select>
                    </Field>
                    <Field label="套餐名称 / Offer name"><Input value={option.title} onChange={(event) => updateOption(optionIndex, { title: event.target.value })} /></Field>
                    <Field label="说明 / Subtitle"><Input value={option.subtitle || ""} onChange={(event) => updateOption(optionIndex, { subtitle: event.target.value })} /></Field>
                    <Field label="角标 / Badge"><Input placeholder="Buy 2 get 1 free" value={option.badge || ""} onChange={(event) => updateOption(optionIndex, { badge: event.target.value })} /></Field>
                    <Field label="赠品说明 / Gift label"><Input placeholder="+ Free gift" value={option.gift_label || ""} onChange={(event) => updateOption(optionIndex, { gift_label: event.target.value })} /></Field>
                    <div className="grid grid-cols-[100px_1fr] gap-2">
                      <Field label="币种 / Currency"><Input value={option.compare_currency} maxLength={3} onChange={(event) => updateOption(optionIndex, { compare_currency: event.target.value })} /></Field>
                      <Field label="划线价 / Compare-at"><Input type="number" min="0" step="0.01" value={option.compare_value} onChange={(event) => updateOption(optionIndex, { compare_value: event.target.value })} /></Field>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-5">
                    <Check label="启用 / Active" checked={option.is_active} onChange={(is_active) => updateOption(optionIndex, { is_active })} />
                    <Check label="默认选择 / Default" checked={option.is_default} onChange={(is_default) => setDraft((current) => ({ ...current, options: current.options.map((item, index) => ({ ...item, is_default: index === optionIndex ? is_default : is_default ? false : item.is_default })) }))} />
                  </div>

                  <div className="mt-5 border-t border-ui-border-base pt-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div><Text weight="plus" size="small">库存组成 / Inventory kit</Text><Text size="xsmall" className="text-ui-fg-subtle">数量为每份实际发货总数，包含赠品：三盒装填 3，五盒装填 5。同一库存项合并填写。<br />Enter all shipped units per pack, including free units. Combine the same inventory item into one row.</Text></div>
                      <Button type="button" size="small" variant="secondary" onClick={() => updateOption(optionIndex, { components: [...option.components, emptyComponent()] })}><Plus /> 添加组件 / Add</Button>
                    </div>
                    <div className="flex flex-col gap-3">
                      {option.components.map((component, componentIndex) => (
                        <div className="grid gap-2 rounded-md bg-ui-bg-subtle p-3 sm:grid-cols-[minmax(180px,1fr)_90px_110px_minmax(120px,1fr)_auto]" key={component.id || `component-${componentIndex}`}>
                          <Select value={component.inventory_item_id || undefined} onValueChange={(inventory_item_id) => updateOption(optionIndex, { components: option.components.map((item, index) => index === componentIndex ? { ...item, inventory_item_id } : item) })}>
                            <Select.Trigger><Select.Value placeholder="库存项 / Inventory item" /></Select.Trigger>
                            <Select.Content>{inventoryItems.map((item) => <Select.Item key={item.id} value={item.id}>{item.title}{item.sku ? ` · ${item.sku}` : ""}</Select.Item>)}</Select.Content>
                          </Select>
                          <Input aria-label="实际发货数量（含赠品） / Shipped units including gifts" type="number" min="1" step="1" value={component.required_quantity} onChange={(event) => updateOption(optionIndex, { components: option.components.map((item, index) => index === componentIndex ? { ...item, required_quantity: Number(event.target.value) } : item) })} />
                          <Select value={component.role} onValueChange={(role) => updateOption(optionIndex, { components: option.components.map((item, index) => index === componentIndex ? { ...item, role: role as "paid" | "gift" } : item) })}>
                            <Select.Trigger><Select.Value /></Select.Trigger><Select.Content><Select.Item value="paid">付费件 / Paid</Select.Item><Select.Item value="gift">赠品 / Gift</Select.Item></Select.Content>
                          </Select>
                          <Input placeholder="显示名称 / Label" value={component.label || ""} onChange={(event) => updateOption(optionIndex, { components: option.components.map((item, index) => index === componentIndex ? { ...item, label: event.target.value } : item) })} />
                          <Button aria-label="Remove component" type="button" size="small" variant="transparent" onClick={() => updateOption(optionIndex, { components: option.components.filter((_, index) => index !== componentIndex) })}><Trash /></Button>
                        </div>
                      ))}
                      {!option.components.length && <Text size="small" className="text-ui-fg-subtle">未由插件管理库存组件；该变体现有库存配置保持不变。<br />No plugin-managed kit components. Existing variant inventory remains unchanged.</Text>}
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <div className="mr-auto"><Text size="small" className={invalidReason ? "text-ui-fg-error" : "text-ui-fg-subtle"}>{invalidReason || "可保存 / Ready to save"}</Text></div>
            <Drawer.Close asChild><Button type="button" variant="secondary">取消 / Cancel</Button></Drawer.Close>
            <Button type="submit" isLoading={save.isPending} disabled={Boolean(invalidReason)}>保存 / Save</Button>
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-2"><Label>{label}</Label>{children}</div>
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex min-h-8 cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span>{label}</span></label>
}
