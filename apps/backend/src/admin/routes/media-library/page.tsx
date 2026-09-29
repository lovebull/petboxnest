import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Images, Spinner, Trash } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Select,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChangeEvent, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { sdk } from "../../lib/sdk"

type MediaProductReference = {
  id: string
  title: string
  roles: Array<"gallery" | "thumbnail">
}

type MediaVariantReference = {
  id: string
  title: string
  sku: string | null
  product_id: string | null
  product_title: string | null
  roles: Array<"image" | "thumbnail">
}

type MediaAsset = {
  id: string
  file_key: string
  url: string
  filename: string
  mime_type: string
  size: number
  uploaded_by: string | null
  source: "admin_upload"
  created_at: string
  references: {
    products: MediaProductReference[]
    variants: MediaVariantReference[]
    total_count: number
    is_orphan: boolean
  }
}

type MediaLibraryResponse = {
  media: MediaAsset[]
  count: number
  page: number
  page_count: number
  page_size: number
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

const MediaLibraryPage = () => {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")
  const [usage, setUsage] = useState<"all" | "referenced" | "orphan">("all")
  const limit = 24

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim())
      setPage(1)
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  const mediaQuery = useQuery({
    queryKey: ["media-library", page, query, usage],
    queryFn: () =>
      sdk.client.fetch<MediaLibraryResponse>("/admin/media-library", {
        query: {
          page,
          limit,
          q: query || undefined,
          usage,
        },
      }),
  })

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => sdk.admin.upload.create({ files }),
    onSuccess: async () => {
      setPage(1)
      await queryClient.invalidateQueries({ queryKey: ["media-library"] })
      toast.success("图片已上传并登记到媒体库")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/media-library/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["media-library"] })
      toast.success("S3 文件已永久删除")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).filter((file) =>
      file.type.startsWith("image/")
    )

    if (files.length) {
      uploadMutation.mutate(files)
    }

    event.target.value = ""
  }

  const handlePermanentDelete = (asset: MediaAsset) => {
    const confirmed = window.confirm(
      `确认永久删除“${asset.filename}”？\n\n此操作会删除 S3 原始文件，无法恢复。商品仍在使用的图片将被阻止删除。`
    )

    if (confirmed) {
      deleteMutation.mutate(asset.id)
    }
  }

  const assets = mediaQuery.data?.media || []
  const pageCount = mediaQuery.data?.page_count || 1

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="p-0">
        <div className="flex flex-col gap-4 border-b px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <Heading level="h1">媒体库</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Media Library · 仅管理通过 Medusa Admin 上传的图片
            </Text>
          </div>
          <label className="relative">
            <input
              className="absolute inset-0 cursor-pointer opacity-0"
              type="file"
              accept="image/*"
              multiple
              disabled={uploadMutation.isPending}
              onChange={handleUpload}
            />
            <Button
              size="small"
              type="button"
              isLoading={uploadMutation.isPending}
              disabled={uploadMutation.isPending}
            >
              上传图片 / Upload
            </Button>
          </label>
        </div>

        <div className="flex flex-col gap-3 border-b px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="搜索文件名或存储键"
              className="sm:w-80"
            />
            <Select
              value={usage}
              onValueChange={(value) => {
                setUsage(value as "all" | "referenced" | "orphan")
                setPage(1)
              }}
            >
              <Select.Trigger className="sm:w-52">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">全部图片 / All</Select.Item>
                <Select.Item value="referenced">
                  已被引用 / Referenced
                </Select.Item>
                <Select.Item value="orphan">
                  孤立图片 / Orphaned
                </Select.Item>
              </Select.Content>
            </Select>
            {(query || usage !== "all") && (
              <Button
                size="small"
                variant="secondary"
                onClick={() => {
                  setSearch("")
                  setQuery("")
                  setUsage("all")
                  setPage(1)
                }}
              >
                清除筛选
              </Button>
            )}
          </div>
          <Text size="small" className="text-ui-fg-subtle">
            共 {mediaQuery.data?.count || 0} 张图片
          </Text>
        </div>

        {mediaQuery.isLoading ? (
          <div className="flex min-h-80 items-center justify-center">
            <Spinner />
          </div>
        ) : assets.length ? (
          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-base"
              >
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex aspect-square items-center justify-center bg-ui-bg-subtle"
                >
                  <img
                    src={asset.url}
                    alt={asset.filename}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                </a>
                <div className="flex flex-col gap-3 p-4">
                  <div className="min-w-0">
                    <Text weight="plus" className="truncate" title={asset.filename}>
                      {asset.filename}
                    </Text>
                    <Text
                      size="xsmall"
                      className="truncate text-ui-fg-subtle"
                      title={asset.file_key}
                    >
                      {asset.file_key}
                    </Text>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      size="2xsmall"
                      color={asset.references.is_orphan ? "green" : "blue"}
                    >
                      {asset.references.is_orphan
                        ? "孤立图片"
                        : `${asset.references.total_count} 个引用`}
                    </Badge>
                    <Badge size="2xsmall">{asset.mime_type}</Badge>
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      {formatFileSize(asset.size)}
                    </Text>
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      {new Date(asset.created_at).toLocaleString()}
                    </Text>
                  </div>
                  <div className="rounded-md bg-ui-bg-subtle p-3">
                    <Text size="small" leading="compact" weight="plus">
                      图片媒体引用 / References
                    </Text>
                    {asset.references.is_orphan ? (
                      <Text
                        size="small"
                        leading="compact"
                        className="mt-1 text-ui-fg-subtle"
                      >
                        未被任何商品或变体引用
                      </Text>
                    ) : (
                      <div className="mt-2 flex flex-col gap-2">
                        {asset.references.products.map((product) => (
                          <Link
                            key={product.id}
                            to={`/products/${product.id}`}
                            className="rounded-md outline-none hover:text-ui-fg-interactive focus:shadow-borders-interactive-with-focus"
                          >
                            <Text size="small" leading="compact" weight="plus">
                              商品：{product.title}
                            </Text>
                            <Text
                              size="xsmall"
                              leading="compact"
                              className="text-ui-fg-subtle"
                            >
                              {product.roles.includes("gallery")
                                ? "商品图库"
                                : ""}
                              {product.roles.length === 2 ? " · " : ""}
                              {product.roles.includes("thumbnail")
                                ? "商品缩略图"
                                : ""}
                            </Text>
                          </Link>
                        ))}
                        {asset.references.variants.map((variant) => {
                          const content = (
                            <>
                              <Text
                                size="small"
                                leading="compact"
                                weight="plus"
                              >
                                变体：{variant.title}
                              </Text>
                              <Text
                                size="xsmall"
                                leading="compact"
                                className="text-ui-fg-subtle"
                              >
                                {variant.product_title
                                  ? `${variant.product_title} · `
                                  : ""}
                                {variant.sku ? `SKU ${variant.sku} · ` : ""}
                                {variant.roles.includes("image")
                                  ? "变体图片"
                                  : ""}
                                {variant.roles.length === 2 ? " · " : ""}
                                {variant.roles.includes("thumbnail")
                                  ? "变体缩略图"
                                  : ""}
                              </Text>
                            </>
                          )

                          return variant.product_id ? (
                            <Link
                              key={variant.id}
                              to={`/products/${variant.product_id}/variants/${variant.id}`}
                              className="rounded-md outline-none hover:text-ui-fg-interactive focus:shadow-borders-interactive-with-focus"
                            >
                              {content}
                            </Link>
                          ) : (
                            <div key={variant.id}>{content}</div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  <Button
                    size="small"
                    variant="danger"
                    onClick={() => handlePermanentDelete(asset)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash />
                    永久删除文件
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-20 text-center">
            <Text weight="plus">暂无图片</Text>
            <Text size="small" className="mt-1 text-ui-fg-subtle">
              通过商品页面或本媒体库上传的图片会显示在这里。
            </Text>
          </div>
        )}

        <div className="flex items-center justify-between border-t px-6 py-4">
          <Text size="small">
            第 {page} 页，共 {pageCount} 页
          </Text>
          <div className="flex gap-2">
            <Button
              size="small"
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              上一页
            </Button>
            <Button
              size="small"
              variant="secondary"
              disabled={page >= pageCount}
              onClick={() => setPage((current) => current + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "媒体库",
  icon: Images,
  rank: 18,
})

export default MediaLibraryPage
