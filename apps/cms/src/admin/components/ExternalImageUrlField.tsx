"use client"

import type { TextFieldClientComponent } from "payload"
import type { ChangeEvent } from "react"

import { TextInput, useField } from "@payloadcms/ui"
import { useEffect, useMemo, useState } from "react"

function isHttpImageUrl(value: string) {
  try {
    const url = new URL(value)

    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export const ExternalImageUrlField: TextFieldClientComponent = ({
  field,
  path,
}) => {
  const fieldPath = path || field.name
  const { setValue, showError, value } = useField<string>({ path: fieldPath })
  const [failedUrl, setFailedUrl] = useState("")
  const previewUrl = useMemo(
    () => (typeof value === "string" ? value.trim() : ""),
    [value]
  )
  const canPreview = isHttpImageUrl(previewUrl)
  const previewFailed = failedUrl === previewUrl

  useEffect(() => {
    setFailedUrl("")
  }, [previewUrl])

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <TextInput
        description={field.admin?.description}
        label={field.label}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          setValue(event.target.value)
        }
        path={fieldPath}
        placeholder={field.admin?.placeholder}
        required={field.required}
        showError={showError}
        value={value || ""}
      />

      {previewUrl && !canPreview && (
        <p
          style={{
            color: "var(--theme-warning-500)",
            fontSize: 12,
            margin: "-4px 0 0",
          }}
        >
          请输入以 http:// 或 https:// 开头的完整图片地址。 / Enter a full
          image URL beginning with http:// or https://.
        </p>
      )}

      {canPreview && (
        <div
          style={{
            alignItems: "center",
            background: "var(--theme-elevation-50)",
            border: "1px solid var(--theme-elevation-150)",
            borderRadius: 8,
            display: "flex",
            gap: 14,
            maxWidth: 440,
            padding: 10,
          }}
        >
          {!previewFailed ? (
            <img
              alt="外部图片缩略图 / External image thumbnail"
              key={previewUrl}
              loading="lazy"
              onError={() => setFailedUrl(previewUrl)}
              referrerPolicy="no-referrer"
              src={previewUrl}
              style={{
                background: "var(--theme-elevation-100)",
                borderRadius: 6,
                display: "block",
                height: 88,
                objectFit: "cover",
                width: 112,
              }}
            />
          ) : (
            <div
              style={{
                alignItems: "center",
                background: "var(--theme-error-50)",
                borderRadius: 6,
                color: "var(--theme-error-500)",
                display: "flex",
                fontSize: 12,
                height: 88,
                justifyContent: "center",
                padding: 8,
                textAlign: "center",
                width: 112,
              }}
            >
              预览失败
              <br />
              Preview failed
            </div>
          )}

          <div style={{ minWidth: 0 }}>
            <strong style={{ display: "block", fontSize: 13 }}>
              外部图片预览
            </strong>
            <span
              style={{
                color: "var(--theme-elevation-600)",
                display: "block",
                fontSize: 12,
                marginTop: 2,
              }}
            >
              External image preview
            </span>
            <a
              href={previewUrl}
              rel="noreferrer"
              style={{ display: "inline-block", fontSize: 12, marginTop: 8 }}
              target="_blank"
            >
              查看原图 / Open original
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
