import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  ArrowUpRightOnBox,
  BuildingStorefront,
  PencilSquare,
  Spinner,
} from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Drawer,
  Heading,
  Input,
  Label,
  Select,
  Table,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FormEvent, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { sdk } from "../../lib/sdk"

type SupplierSource = {
  id: string
  product_id: string
  supplier_1688_url: string | null
  supplier_taobao_url: string | null
  supplier_jd_url: string | null
  updated_at: string
}

type ProductRow = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  status: string
  variants: Array<{ id: string; title: string; sku: string | null }>
  supplier_source: SupplierSource | null
}

type SupplierSourceListResponse = {
  products: ProductRow[]
  count: number
  page: number
  page_count: number
  page_size: number
}

type SupplierDraft = {
  supplier_1688_url: string
  supplier_taobao_url: string
  supplier_jd_url: string
}

type SupplierLink = {
  label: string
  url: string
}

const emptyDraft: SupplierDraft = {
  supplier_1688_url: "",
  supplier_taobao_url: "",
  supplier_jd_url: "",
}

const supplierFields: Array<{
  key: keyof SupplierDraft
  label: string
  description: string
  placeholder: string
}> = [
  {
    key: "supplier_1688_url",
    label: "1688 采购地址",
    description: "1688 Supplier URL",
    placeholder: "https://detail.1688.com/offer/...",
  },
  {
    key: "supplier_taobao_url",
    label: "淘宝采购地址",
    description: "Taobao Supplier URL",
    placeholder: "https://item.taobao.com/item.htm?...",
  },
  {
    key: "supplier_jd_url",
    label: "京东采购地址",
    description: "JD Supplier URL",
    placeholder: "https://item.jd.com/...",
  },
]

const configuredCount = (source: SupplierSource | null) =>
  source
    ? [
        source.supplier_1688_url,
        source.supplier_taobao_url,
        source.supplier_jd_url,
      ].filter(Boolean).length
    : 0

const getSafeExternalUrl = (value: string | null) => {
  if (!value) {
    return null
  }

  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null
  } catch {
    return null
  }
}

const getSupplierLinks = (source: SupplierSource | null): SupplierLink[] => {
  const candidates = [
    { label: "1688", value: source?.supplier_1688_url || null },
    { label: "淘宝", value: source?.supplier_taobao_url || null },
    { label: "京东", value: source?.supplier_jd_url || null },
  ]

  return candidates.reduce<SupplierLink[]>((links, candidate) => {
    const url = getSafeExternalUrl(candidate.value)

    if (url) {
      links.push({
        label: candidate.label,
        url,
      })
    }

    return links
  }, [])
}

const SupplierSourcesPage = () => {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")
  const [provider, setProvider] = useState("all")
  const [status, setStatus] = useState("all")
  const [activeProduct, setActiveProduct] = useState<ProductRow | null>(null)
  const [draft, setDraft] = useState<SupplierDraft>(emptyDraft)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(search.trim())
      setPage(1)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const source = activeProduct?.supplier_source
    setDraft({
      supplier_1688_url: source?.supplier_1688_url || "",
      supplier_taobao_url: source?.supplier_taobao_url || "",
      supplier_jd_url: source?.supplier_jd_url || "",
    })
  }, [activeProduct])

  const list = useQuery({
    queryKey: ["product-supplier-sources", page, limit, query, provider, status],
    queryFn: () =>
      sdk.client.fetch<SupplierSourceListResponse>(
        "/admin/product-supplier-sources",
        {
          query: {
            page,
            limit,
            q: query || undefined,
            provider,
            status,
          },
        }
      ),
  })

  const save = useMutation({
    mutationFn: (input: { productId: string; values: SupplierDraft }) =>
      sdk.client.fetch(
        `/admin/product-supplier-sources/${input.productId}`,
        {
          method: "POST",
          body: input.values,
        }
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["product-supplier-sources"],
      })
      setActiveProduct(null)
      toast.success("采购供应商地址已保存")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const resetFilters = () => {
    setSearch("")
    setQuery("")
    setProvider("all")
    setStatus("all")
    setPage(1)
  }

  const rows = list.data?.products || []
  const pageCount = list.data?.page_count || 1

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="p-0">
        <div className="border-b px-6 py-5">
          <Heading level="h1">采购供应商地址</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Supplier Sources · 集中维护商品的内部采购链接，不会公开到 Storefront。
          </Text>
        </div>

        <div className="flex flex-col gap-3 border-b px-6 py-4 lg:flex-row lg:items-center">
          <Input
            className="lg:max-w-sm"
            placeholder="搜索商品名称、Handle 或 SKU"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select
            value={provider}
            onValueChange={(value) => {
              setProvider(value)
              setPage(1)
            }}
          >
            <Select.Trigger className="lg:w-48">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">全部平台 / All providers</Select.Item>
              <Select.Item value="1688">1688</Select.Item>
              <Select.Item value="taobao">淘宝 / Taobao</Select.Item>
              <Select.Item value="jd">京东 / JD</Select.Item>
            </Select.Content>
          </Select>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value)
              setPage(1)
            }}
          >
            <Select.Trigger className="lg:w-48">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">全部状态 / All status</Select.Item>
              <Select.Item value="configured">已配置 / Configured</Select.Item>
              <Select.Item value="missing">未配置 / Missing</Select.Item>
            </Select.Content>
          </Select>
          {(query || provider !== "all" || status !== "all") && (
            <Button size="small" variant="secondary" onClick={resetFilters}>
              清除筛选 / Clear
            </Button>
          )}
          <Text className="lg:ml-auto text-ui-fg-subtle" size="small">
            共 {list.data?.count || 0} 个商品
          </Text>
        </div>

        {list.isLoading ? (
          <div className="flex min-h-80 items-center justify-center">
            <Spinner />
          </div>
        ) : list.isError ? (
          <div className="px-6 py-16 text-center">
            <Text className="text-ui-fg-error" weight="plus">
              无法载入供应商地址
            </Text>
            <Text className="mt-1 text-ui-fg-subtle" size="small">
              {list.error instanceof Error ? list.error.message : "Unknown error"}
            </Text>
          </div>
        ) : rows.length ? (
          <div className="overflow-x-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>商品 / Product</Table.HeaderCell>
                  <Table.HeaderCell>SKU</Table.HeaderCell>
                  <Table.HeaderCell>采购平台 / Sources</Table.HeaderCell>
                  <Table.HeaderCell>状态 / Status</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">操作 / Action</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {rows.map((product) => {
                  const count = configuredCount(product.supplier_source)
                  const supplierLinks = getSupplierLinks(
                    product.supplier_source
                  )

                  return (
                    <Table.Row key={product.id}>
                      <Table.Cell>
                        <div className="flex min-w-64 items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-ui-bg-subtle">
                            {product.thumbnail ? (
                              <img
                                alt=""
                                className="size-full object-cover"
                                src={product.thumbnail}
                              />
                            ) : (
                              <BuildingStorefront />
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              className="block truncate font-medium hover:text-ui-fg-interactive"
                              to={`/products/${product.id}`}
                            >
                              {product.title}
                            </Link>
                            <Text className="truncate text-ui-fg-subtle" size="xsmall">
                              {product.handle || product.id}
                            </Text>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Text className="max-w-48 truncate" size="small">
                          {product.variants.map((variant) => variant.sku).filter(Boolean).join(", ") || "—"}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex min-w-64 flex-col gap-2 py-1">
                          {supplierLinks.map((link) => (
                            <a
                              className="group flex items-center gap-2 rounded-md outline-none hover:text-ui-fg-interactive focus:shadow-borders-interactive-with-focus"
                              href={link.url}
                              key={link.label}
                              rel="noreferrer noopener"
                              target="_blank"
                            >
                              <Badge className="shrink-0" size="2xsmall">
                                {link.label}
                              </Badge>
                              <Text
                                className="text-ui-fg-interactive group-hover:underline"
                                leading="compact"
                                size="small"
                                weight="plus"
                              >
                                打开 / Open
                              </Text>
                              <ArrowUpRightOnBox className="shrink-0 text-ui-fg-muted" />
                            </a>
                          ))}
                          {!supplierLinks.length && (
                            <Text className="text-ui-fg-muted" size="small">
                              未设置供应商链接 / Not set
                            </Text>
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={count ? "green" : "grey"} size="2xsmall">
                          {count ? `已配置 ${count} 个` : "未配置"}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex justify-end">
                          <Button
                            size="small"
                            variant="secondary"
                            onClick={() => setActiveProduct(product)}
                          >
                            <PencilSquare />
                            编辑 / Edit
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table>
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <Text weight="plus">没有符合条件的商品</Text>
            <Text className="mt-1 text-ui-fg-subtle" size="small">
              No products match the selected filters.
            </Text>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Text size="small">
            第 {page} 页，共 {pageCount} 页 · {list.data?.count || 0} 个商品
          </Text>
          <div className="flex items-center gap-2">
            <Select
              value={String(limit)}
              onValueChange={(value) => {
                setLimit(Number(value))
                setPage(1)
              }}
            >
              <Select.Trigger className="w-24">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {[20, 50, 100].map((size) => (
                  <Select.Item key={size} value={String(size)}>
                    {size} 条
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Button
              disabled={page <= 1}
              size="small"
              variant="secondary"
              onClick={() => setPage((current) => current - 1)}
            >
              上一页
            </Button>
            <Input
              className="w-16"
              max={pageCount}
              min={1}
              type="number"
              value={page}
              onChange={(event) =>
                setPage(
                  Math.max(1, Math.min(Number(event.target.value), pageCount))
                )
              }
            />
            <Button
              disabled={page >= pageCount}
              size="small"
              variant="secondary"
              onClick={() => setPage((current) => current + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      </Container>

      <Drawer
        open={Boolean(activeProduct)}
        onOpenChange={(open) => !open && setActiveProduct(null)}
      >
        <Drawer.Content>
          <form
            className="flex h-full flex-col"
            onSubmit={(event: FormEvent) => {
              event.preventDefault()
              if (activeProduct) {
                save.mutate({ productId: activeProduct.id, values: draft })
              }
            }}
          >
            <Drawer.Header>
              <Drawer.Title>编辑采购供应商地址</Drawer.Title>
              <Drawer.Description>
                {activeProduct?.title} · Edit supplier sources
              </Drawer.Description>
            </Drawer.Header>
            <Drawer.Body className="flex-1 overflow-auto p-6">
              <div className="flex flex-col gap-5">
                {supplierFields.map((field) => (
                  <div className="flex flex-col gap-2" key={field.key}>
                    <div>
                      <Label htmlFor={`supplier-source-${field.key}`}>
                        {field.label}
                      </Label>
                      <Text className="text-ui-fg-subtle" size="xsmall">
                        {field.description}
                      </Text>
                    </div>
                    <Input
                      id={`supplier-source-${field.key}`}
                      placeholder={field.placeholder}
                      type="url"
                      value={draft[field.key]}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          [field.key]: event.target.value,
                        }))
                      }
                    />
                  </div>
                ))}
                <div className="rounded-md bg-ui-bg-subtle p-3">
                  <Text size="small">
                    这些链接仅供后台采购人员使用，不会出现在商品 Store API 或商城页面中。
                  </Text>
                  <Text className="text-ui-fg-subtle" size="xsmall">
                    Internal sourcing data is not exposed to the Storefront.
                  </Text>
                </div>
              </div>
            </Drawer.Body>
            <Drawer.Footer>
              <Drawer.Close asChild>
                <Button size="small" type="button" variant="secondary">
                  取消 / Cancel
                </Button>
              </Drawer.Close>
              <Button isLoading={save.isPending} size="small" type="submit">
                保存 / Save
              </Button>
            </Drawer.Footer>
          </form>
        </Drawer.Content>
      </Drawer>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "采购供应商 / Supplier Sources",
  icon: BuildingStorefront,
  rank: 22,
})

export default SupplierSourcesPage
