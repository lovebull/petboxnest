"use client"

import type { DefaultCellComponentProps } from "payload"

import { Link, useConfig } from "@payloadcms/ui"
import { formatAdminURL } from "payload/shared"

type MediaRowData = {
  alt?: string | null
  filename?: string | null
  mimeType?: string | null
  thumbnailURL?: string | null
  url?: string | null
  sizes?: {
    thumbnail?: {
      url?: string | null
    }
  }
}

function getMediaPreviewUrl(rowData: MediaRowData) {
  return rowData.sizes?.thumbnail?.url || rowData.thumbnailURL || rowData.url || ""
}

function normalizePreviewUrl(url: string) {
  if (!url || url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }

  return url.startsWith("/") ? url : `/${url}`
}

export function MediaPreviewCell({
  cellData,
  collectionSlug,
  link,
  linkURL,
  onClick,
  rowData,
}: DefaultCellComponentProps) {
  const { config } = useConfig()
  const media = rowData as MediaRowData
  const previewUrl = normalizePreviewUrl(getMediaPreviewUrl(media))
  const isImage = media.mimeType?.startsWith("image/")
  const label = media.alt || media.filename || "Media preview"

  const preview = !isImage || !previewUrl ? (
    <div
      title={media.mimeType || "File"}
      style={{
        alignItems: "center",
        background: "var(--theme-elevation-50)",
        border: "1px solid var(--theme-elevation-150)",
        borderRadius: 6,
        color: "var(--theme-elevation-600)",
        display: "flex",
        fontSize: 11,
        fontWeight: 600,
        height: 48,
        justifyContent: "center",
        lineHeight: 1.2,
        overflow: "hidden",
        textAlign: "center",
        width: 64,
      }}
    >
      {(media.mimeType || "FILE").split("/").pop()?.toUpperCase() || "FILE"}
    </div>
  ) : (
    <img
      src={previewUrl}
      alt={label}
      loading="lazy"
      style={{
        background: "var(--theme-elevation-50)",
        border: "1px solid var(--theme-elevation-150)",
        borderRadius: 6,
        display: "block",
        height: 48,
        objectFit: "cover",
        width: 64,
      }}
    />
  )

  if (typeof onClick === "function") {
    return (
      <button
        aria-label={`选择 ${label} / Select ${label}`}
        onClick={() => onClick({ cellData, collectionSlug, rowData })}
        style={{
          background: "transparent",
          border: 0,
          cursor: "pointer",
          display: "block",
          padding: 0,
        }}
        type="button"
      >
        {preview}
      </button>
    )
  }

  if (link) {
    const href =
      linkURL ||
      formatAdminURL({
        adminRoute: config.routes.admin,
        path: `/collections/${collectionSlug}/${encodeURIComponent(String(rowData.id))}`,
      })

    return (
      <Link aria-label={label} href={href} prefetch={false}>
        {preview}
      </Link>
    )
  }

  return preview
}
