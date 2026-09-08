"use client"

import { Button, toast, useConfig } from "@payloadcms/ui"
import { useRouter } from "next/navigation"
import type { DefaultCellComponentProps } from "payload"
import { formatAdminURL } from "payload/shared"
import { useState } from "react"

export function ContactSubmissionActionsField() {
  return null
}

export function ContactSubmissionActionsCell({
  collectionSlug,
  rowData,
}: DefaultCellComponentProps) {
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()
  const {
    config: {
      routes: { admin: adminRoute, api: apiRoute },
    },
  } = useConfig()
  const id = rowData.id
  const editURL = formatAdminURL({
    adminRoute,
    path: `/collections/${collectionSlug}/${id}`,
  })

  const deleteSubmission = async () => {
    if (
      !id ||
      !window.confirm(
        `确定删除 ${rowData.email || `#${id}`} 的联系表单吗？此操作无法撤销。`
      )
    ) {
      return
    }

    setDeleting(true)

    try {
      const response = await fetch(
        formatAdminURL({ apiRoute, path: `/${collectionSlug}/${id}` }),
        {
          method: "DELETE",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
        }
      )

      if (!response.ok) {
        const result = (await response.json().catch(() => ({}))) as {
          message?: string
        }
        throw new Error(result.message || "删除失败")
      }

      toast.success("联系表单已删除")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "删除失败")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
      onClick={(event) => event.stopPropagation()}
    >
      <Button
        buttonStyle="secondary"
        el="link"
        margin={false}
        size="small"
        to={editURL}
      >
        编辑
      </Button>
      <Button
        buttonStyle="error"
        disabled={deleting}
        margin={false}
        onClick={() => void deleteSubmission()}
        size="small"
        type="button"
      >
        {deleting ? "删除中…" : "删除"}
      </Button>
    </div>
  )
}
