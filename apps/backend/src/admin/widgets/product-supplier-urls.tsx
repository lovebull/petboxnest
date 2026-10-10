import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { AdminProduct, DetailWidgetProps } from "@medusajs/framework/types"
import { PencilSquare, Spinner } from "@medusajs/icons"
import {
  Button,
  Container,
  Drawer,
  Heading,
  Input,
  Label,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FormEvent, useEffect, useState } from "react"
import { sdk } from "../lib/sdk"

type SupplierUrlKey =
  | "supplier_1688_url"
  | "supplier_taobao_url"
  | "supplier_jd_url"

type SupplierUrls = Record<SupplierUrlKey, string>

type SupplierSourceResponse = {
  supplier_source: {
    id: string
    supplier_1688_url: string | null
    supplier_taobao_url: string | null
    supplier_jd_url: string | null
  } | null
}

const supplierFields: Array<{
  key: SupplierUrlKey
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

const emptySupplierUrls: SupplierUrls = {
  supplier_1688_url: "",
  supplier_taobao_url: "",
  supplier_jd_url: "",
}

const getLegacyMetadataUrls = (
  metadata: AdminProduct["metadata"]
): SupplierUrls => ({
  supplier_1688_url:
    typeof metadata?.supplier_1688_url === "string"
      ? metadata.supplier_1688_url
      : "",
  supplier_taobao_url:
    typeof metadata?.supplier_taobao_url === "string"
      ? metadata.supplier_taobao_url
      : "",
  supplier_jd_url:
    typeof metadata?.supplier_jd_url === "string"
      ? metadata.supplier_jd_url
      : "",
})

const getSafeExternalUrl = (value: string) => {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null
  } catch {
    return null
  }
}

const ProductSupplierUrlsWidget = ({
  data,
}: DetailWidgetProps<AdminProduct>) => {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState<SupplierUrls>(emptySupplierUrls)
  const legacyUrls = getLegacyMetadataUrls(data.metadata)
  const detail = useQuery({
    queryKey: ["product-supplier-source", data.id],
    queryFn: () =>
      sdk.client.fetch<SupplierSourceResponse>(
        `/admin/product-supplier-sources/${data.id}`
      ),
  })
  const source = detail.data?.supplier_source
  const saved: SupplierUrls = source
    ? {
        supplier_1688_url: source.supplier_1688_url || "",
        supplier_taobao_url: source.supplier_taobao_url || "",
        supplier_jd_url: source.supplier_jd_url || "",
      }
    : legacyUrls

  useEffect(() => {
    if (isOpen) {
      setDraft(saved)
    }
  }, [isOpen, source?.id])

  const save = useMutation({
    mutationFn: (values: SupplierUrls) =>
      sdk.client.fetch(`/admin/product-supplier-sources/${data.id}`, {
        method: "POST",
        body: values,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["product-supplier-source", data.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["product-supplier-sources"],
        }),
      ])
      setIsOpen(false)
      toast.success("采购供应商地址已保存")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return (
    <>
      <Container className="divide-y p-0">
        <div className="flex items-start justify-between gap-x-4 px-6 py-4">
          <div>
            <Heading level="h2">采购供应商地址</Heading>
            <Text className="text-ui-fg-subtle" size="small">
              Supplier purchasing links
            </Text>
          </div>
          <Button
            onClick={() => setIsOpen(true)}
            size="small"
            variant="secondary"
          >
            <PencilSquare />
            编辑 / Edit
          </Button>
        </div>

        <div className="flex flex-col gap-y-4 px-6 py-4">
          <div>
            <Text className="text-ui-fg-subtle" size="small">
              保存商品在 1688、淘宝和京东的内部采购来源，不会显示在 Storefront。
            </Text>
            <Text className="text-ui-fg-subtle" size="small">
              Internal sourcing links for this product. These links are not shown on the Storefront.
            </Text>
          </div>

          {detail.isLoading ? (
            <div className="flex items-center gap-2 py-2">
              <Spinner />
              <Text className="text-ui-fg-subtle" size="small">
                正在载入 / Loading
              </Text>
            </div>
          ) : detail.isError ? (
            <Text className="text-ui-fg-error" size="small">
              无法载入供应商地址：{detail.error instanceof Error ? detail.error.message : "Unknown error"}
            </Text>
          ) : (
            <div className="flex flex-col gap-y-3">
              {supplierFields.map(({ key, label }) => {
                const value = saved[key]
                const safeUrl = getSafeExternalUrl(value)

                return (
                  <div
                    className="flex items-center justify-between gap-x-4"
                    key={key}
                  >
                    <Text size="small" weight="plus">
                      {label}
                    </Text>
                    {safeUrl ? (
                      <a
                        className="max-w-[50%] truncate text-ui-fg-interactive txt-compact-small-plus hover:underline"
                        href={safeUrl}
                        rel="noreferrer"
                        target="_blank"
                        title={value}
                      >
                        打开 / Open
                      </a>
                    ) : (
                      <Text className="text-ui-fg-muted" size="small">
                        未设置 / Not set
                      </Text>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Container>

      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <Drawer.Content>
          <form
            className="flex h-full flex-col"
            onSubmit={(event: FormEvent) => {
              event.preventDefault()
              save.mutate(draft)
            }}
          >
            <Drawer.Header>
              <Drawer.Title>编辑采购供应商地址</Drawer.Title>
              <Drawer.Description>
                Edit supplier purchasing links
              </Drawer.Description>
            </Drawer.Header>

            <Drawer.Body className="flex-1 overflow-auto p-4">
              <div className="flex flex-col gap-y-5">
                {supplierFields.map(
                  ({ key, label, description, placeholder }) => (
                    <div className="flex flex-col gap-y-2" key={key}>
                      <div>
                        <Label htmlFor={`product-${key}`}>{label}</Label>
                        <Text className="text-ui-fg-subtle" size="xsmall">
                          {description}
                        </Text>
                      </div>
                      <Input
                        id={`product-${key}`}
                        name={key}
                        placeholder={placeholder}
                        type="url"
                        value={draft[key]}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            [key]: event.target.value,
                          }))
                        }
                      />
                    </div>
                  )
                )}
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
    </>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details",
  id: "petboxnest-product-supplier-urls",
})

export default ProductSupplierUrlsWidget
