import { model } from "@medusajs/framework/utils"

const MediaAsset = model
  .define(
    { tableName: "pbn_media_asset", name: "MediaAsset" },
    {
      id: model.id({ prefix: "media" }).primaryKey(),
      file_key: model.text().unique(),
      url: model.text(),
      filename: model.text(),
      mime_type: model.text(),
      size: model.number(),
      uploaded_by: model.text().nullable(),
      source: model.enum(["admin_upload"]).default("admin_upload"),
    }
  )
  .indexes([
    {
      name: "IDX_pbn_media_asset_created_at",
      on: ["created_at"],
    },
    {
      name: "IDX_pbn_media_asset_mime_created",
      on: ["mime_type", "created_at"],
    },
    {
      name: "IDX_pbn_media_asset_filename",
      on: ["filename"],
    },
  ])

export default MediaAsset
