import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Images, Spinner, Trash } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChangeEvent, useEffect, useState } from "react"
import { sdk } from "../../lib/sdk"

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
  const limit = 24

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim())
      setPage(1)
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  const mediaQuery = useQuery({
    queryKey: ["media-library", page, query],
    queryFn: () =>
      sdk.client.fetch<MediaLibraryResponse>("/admin/media-library", {
        query: {
          page,
          limit,
          q: query || undefined,
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

        <div className="flex flex-col gap-3 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜索文件名或存储键"
            className="sm:max-w-sm"
          />
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
                    <Badge size="2xsmall">{asset.mime_type}</Badge>
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      {formatFileSize(asset.size)}
                    </Text>
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      {new Date(asset.created_at).toLocaleString()}
                    </Text>
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
