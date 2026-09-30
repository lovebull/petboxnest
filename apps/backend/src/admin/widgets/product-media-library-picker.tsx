import { defineWidgetConfig } from "@medusajs/admin-sdk";
import type {
  AdminProduct,
  DetailWidgetProps,
} from "@medusajs/framework/types";
import { Images, Spinner } from "@medusajs/icons";
import {
  Badge,
  Button,
  Checkbox,
  Container,
  FocusModal,
  Input,
  Select,
  Text,
  toast,
} from "@medusajs/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { sdk } from "../lib/sdk";

type MediaUsage = "all" | "referenced" | "orphan";

type MediaAsset = {
  id: string;
  file_key: string;
  url: string;
  filename: string;
  mime_type: string;
  size: number;
  references: {
    total_count: number;
    is_orphan: boolean;
  };
};

type MediaLibraryResponse = {
  media: MediaAsset[];
  count: number;
  page: number;
  page_count: number;
  page_size: number;
};

const PAGE_SIZE = 24;

const ProductMediaLibraryPicker = ({
  data: product,
}: DetailWidgetProps<AdminProduct>) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [usage, setUsage] = useState<MediaUsage>("all");
  const [selectedAssets, setSelectedAssets] = useState<
    Record<string, MediaAsset>
  >({});

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  const currentImageUrls = useMemo(() => {
    const urls = new Set(
      (product.images || [])
        .map((image) => image.url)
        .filter((url): url is string => Boolean(url)),
    );

    if (product.thumbnail) {
      urls.add(product.thumbnail);
    }

    return urls;
  }, [product.images, product.thumbnail]);

  const mediaQuery = useQuery({
    queryKey: ["media-library-product-picker", page, query, usage],
    queryFn: () =>
      sdk.client.fetch<MediaLibraryResponse>("/admin/media-library", {
        query: {
          page,
          limit: PAGE_SIZE,
          q: query || undefined,
          usage,
        },
      }),
    enabled: open,
    placeholderData: (previousData) => previousData,
  });

  const addImagesMutation = useMutation({
    mutationFn: async (assets: MediaAsset[]) => {
      const newImages = assets
        .filter((asset) => !currentImageUrls.has(asset.url))
        .map((asset) => ({ url: asset.url }));

      if (!newImages.length) {
        return { addedCount: 0 };
      }

      await sdk.admin.product.update(product.id, {
        images: [
          ...(product.images || []).map((image) => ({
            id: image.id,
            url: image.url,
          })),
          ...newImages,
        ],
        thumbnail: product.thumbnail || null,
      });

      return { addedCount: newImages.length };
    },
    onSuccess: async ({ addedCount }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["media-library"] }),
        queryClient.invalidateQueries({
          queryKey: ["media-library-product-picker"],
        }),
      ]);

      if (addedCount) {
        toast.success(`已将 ${addedCount} 张媒体库图片添加到商品`);
      } else {
        toast.info("所选图片已存在于当前商品中");
      }

      setSelectedAssets({});
      setOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "添加媒体库图片失败");
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (addImagesMutation.isPending) {
      return;
    }

    setOpen(nextOpen);
    if (!nextOpen) {
      setSelectedAssets({});
    }
  };

  const toggleAsset = (asset: MediaAsset) => {
    if (currentImageUrls.has(asset.url)) {
      return;
    }

    setSelectedAssets((current) => {
      if (current[asset.id]) {
        const next = { ...current };
        delete next[asset.id];
        return next;
      }

      return { ...current, [asset.id]: asset };
    });
  };

  const selectedCount = Object.keys(selectedAssets).length;
  const assets = mediaQuery.data?.media || [];
  const pageCount = mediaQuery.data?.page_count || 1;

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-ui-bg-subtle">
            <Images className="text-ui-fg-subtle" />
          </div>
          <div>
            <Text size="small" leading="compact" weight="plus">
              从媒体库添加图片
            </Text>
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              Reuse Media Library images without uploading another S3 copy.
            </Text>
          </div>
        </div>
        <Button
          size="small"
          variant="secondary"
          type="button"
          onClick={() => setOpen(true)}
        >
          选择图片 / Select
        </Button>
      </div>

      <div className="flex items-center justify-between gap-3 px-6 py-4">
        <Text size="small" leading="compact" className="text-ui-fg-subtle">
          当前商品共有 {product.images?.length || 0}{" "}
          张图库图片；已有图片不会重复添加。
        </Text>
        <Badge size="2xsmall" color="grey">
          URL reuse
        </Badge>
      </div>

      <FocusModal open={open} onOpenChange={handleOpenChange}>
        <FocusModal.Content>
          <div className="flex h-full flex-col overflow-hidden">
            <FocusModal.Header>
              <div className="flex min-w-0 flex-1 items-center justify-between gap-4 pr-2">
                <div className="min-w-0">
                  <Text size="small" leading="compact" weight="plus">
                    选择媒体库图片
                  </Text>
                  <Text
                    size="small"
                    leading="compact"
                    className="text-ui-fg-subtle"
                  >
                    Select Media Library Images · 已选择 {selectedCount} 张
                  </Text>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <FocusModal.Close asChild>
                    <Button
                      size="small"
                      variant="secondary"
                      disabled={addImagesMutation.isPending}
                    >
                      取消 / Cancel
                    </Button>
                  </FocusModal.Close>
                  <Button
                    size="small"
                    disabled={!selectedCount || addImagesMutation.isPending}
                    isLoading={addImagesMutation.isPending}
                    onClick={() =>
                      addImagesMutation.mutate(Object.values(selectedAssets))
                    }
                  >
                    添加所选图片 ({selectedCount})
                  </Button>
                </div>
              </div>
            </FocusModal.Header>

            <FocusModal.Body className="flex flex-1 flex-col overflow-hidden p-0">
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
                      setUsage(value as MediaUsage);
                      setPage(1);
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
                        setSearch("");
                        setQuery("");
                        setUsage("all");
                        setPage(1);
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

              <div className="flex-1 overflow-y-auto">
                {mediaQuery.isLoading ? (
                  <div className="flex min-h-80 items-center justify-center">
                    <Spinner />
                  </div>
                ) : mediaQuery.isError ? (
                  <div className="flex min-h-80 flex-col items-center justify-center gap-3 px-6 text-center">
                    <Text size="small" weight="plus">
                      媒体库加载失败
                    </Text>
                    <Text size="small" className="text-ui-fg-subtle">
                      {mediaQuery.error instanceof Error
                        ? mediaQuery.error.message
                        : "请稍后重试"}
                    </Text>
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => mediaQuery.refetch()}
                    >
                      重新加载
                    </Button>
                  </div>
                ) : assets.length ? (
                  <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                    {assets.map((asset) => {
                      const alreadyUsed = currentImageUrls.has(asset.url);
                      const selected = Boolean(selectedAssets[asset.id]);

                      return (
                        <div
                          key={asset.id}
                          role="checkbox"
                          aria-checked={selected}
                          aria-disabled={alreadyUsed}
                          tabIndex={alreadyUsed ? -1 : 0}
                          onClick={() => toggleAsset(asset)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              toggleAsset(asset);
                            }
                          }}
                          className={`relative overflow-hidden rounded-lg border bg-ui-bg-base transition-colors ${
                            alreadyUsed
                              ? "cursor-not-allowed border-ui-border-base opacity-60"
                              : selected
                                ? "cursor-pointer border-ui-border-interactive"
                                : "cursor-pointer border-ui-border-base hover:border-ui-border-strong"
                          }`}
                        >
                          <div className="absolute left-2 top-2 z-10 rounded-md bg-ui-bg-base p-1 shadow-elevation-card-rest">
                            <Checkbox
                              checked={alreadyUsed || selected}
                              disabled={alreadyUsed}
                              onCheckedChange={() => toggleAsset(asset)}
                              onClick={(event) => event.stopPropagation()}
                              aria-label={`选择 ${asset.filename}`}
                            />
                          </div>
                          {alreadyUsed && (
                            <Badge
                              size="2xsmall"
                              color="green"
                              className="absolute right-2 top-2 z-10"
                            >
                              已在商品中
                            </Badge>
                          )}
                          <div className="flex aspect-square items-center justify-center bg-ui-bg-subtle">
                            <img
                              src={asset.url}
                              alt={asset.filename}
                              className="h-full w-full object-contain"
                              loading="lazy"
                            />
                          </div>
                          <div className="flex flex-col gap-1 p-3">
                            <Text
                              size="small"
                              leading="compact"
                              weight="plus"
                              className="truncate"
                              title={asset.filename}
                            >
                              {asset.filename}
                            </Text>
                            <Text
                              size="xsmall"
                              leading="compact"
                              className="text-ui-fg-subtle"
                            >
                              {asset.references.is_orphan
                                ? "未引用 / Orphaned"
                                : `${asset.references.total_count} 个引用 / References`}
                            </Text>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex min-h-80 flex-col items-center justify-center gap-2 px-6 text-center">
                    <Images className="text-ui-fg-muted" />
                    <Text size="small" weight="plus">
                      没有找到图片
                    </Text>
                    <Text size="small" className="text-ui-fg-subtle">
                      请调整筛选条件，或先到独立媒体库上传图片。
                    </Text>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-4 border-t px-6 py-4">
                <Text size="small" className="text-ui-fg-subtle">
                  第 {page} 页，共 {pageCount} 页
                </Text>
                <div className="flex items-center gap-2">
                  <Button
                    size="small"
                    variant="secondary"
                    disabled={page <= 1 || mediaQuery.isFetching}
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                  >
                    上一页
                  </Button>
                  <Button
                    size="small"
                    variant="secondary"
                    disabled={page >= pageCount || mediaQuery.isFetching}
                    onClick={() =>
                      setPage((current) => Math.min(pageCount, current + 1))
                    }
                  >
                    下一页
                  </Button>
                </div>
              </div>
            </FocusModal.Body>
          </div>
        </FocusModal.Content>
      </FocusModal>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details",
  id: "petboxnest-product-media-library-picker",
});

export default ProductMediaLibraryPicker;
