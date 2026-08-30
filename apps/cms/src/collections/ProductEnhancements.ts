import {
  FixedToolbarFeature,
  lexicalEditor,
  UploadFeature,
} from "@payloadcms/richtext-lexical"
import type { Access, CollectionConfig } from "payload"

const publishedOrAuthenticated: Access = ({ req }) => {
  if (req.user) {
    return true
  }

  return {
    status: {
      equals: "published",
    },
  }
}

export const ProductEnhancements: CollectionConfig = {
  slug: "product-enhancements",
  access: {
    read: publishedOrAuthenticated,
  },
  admin: {
    defaultColumns: ["title", "medusa_product_handle", "status", "updatedAt"],
    group: "Medusa 增强内容 / Medusa Enhancements",
    useAsTitle: "title",
  },
  labels: {
    singular: "产品增强内容 / Product Enhancement",
    plural: "产品增强内容 / Product Enhancements",
  },
  fields: [
    {
      name: "status",
      type: "select",
      defaultValue: "draft",
      label: "状态 / Status",
      options: [
        { label: "草稿 / Draft", value: "draft" },
        { label: "已发布 / Published", value: "published" },
      ],
      required: true,
    },
    {
      name: "medusa_product_id",
      type: "text",
      label: "Medusa 产品 ID / Medusa Product ID",
      admin: {
        components: {
          Field:
            "/admin/components/MedusaProductPicker#MedusaProductPicker",
        },
        description:
          "可选。点击获取已发布产品后选择，或手动填写 prod_01... / Optional. Select a published product or enter prod_01... manually.",
      },
      index: true,
      unique: true,
    },
    {
      name: "medusa_product_handle",
      type: "text",
      label: "Medusa 产品 Handle / Medusa Product Handle",
      admin: {
        description:
          "Storefront 产品详情页 URL 使用的 handle。选择产品 ID 时会自动同步。 / Product handle used by the storefront URL. It is synced when selecting a product ID.",
      },
      index: true,
      required: true,
      unique: true,
    },
    {
      name: "title",
      type: "text",
      label: "标题 / Title",
      required: true,
    },
    {
      name: "subtitle",
      type: "textarea",
      label: "副标题 / Subtitle",
    },
    {
      name: "content",
      type: "richText",
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          FixedToolbarFeature(),
          UploadFeature({
            enabledCollections: ["media"],
          }),
        ],
      }),
      label: "富文本内容 / Rich Text Content",
    },
    {
      name: "hero_eyebrow",
      type: "text",
      label: "Hero 小标题 / Hero Eyebrow",
    },
    {
      name: "highlights",
      type: "array",
      label: "亮点 / Highlights",
      fields: [
        {
          name: "label",
          type: "text",
          label: "标签 / Label",
        },
        {
          name: "description",
          type: "textarea",
          label: "描述 / Description",
        },
      ],
      maxRows: 6,
    },
    {
      name: "story_sections",
      type: "array",
      label: "故事区块 / Story Sections",
      fields: [
        {
          name: "heading",
          type: "text",
          label: "标题 / Heading",
        },
        {
          name: "body",
          type: "textarea",
          label: "正文 / Body",
        },
        {
          name: "image",
          type: "upload",
          label: "图片 / Image",
          relationTo: "media",
        },
        {
          name: "image_position",
          type: "select",
          defaultValue: "left",
          label: "图片位置 / Image Position",
          options: [
            { label: "图片在左 / Image Left", value: "left" },
            { label: "图片在右 / Image Right", value: "right" },
          ],
        },
      ],
    },
    {
      name: "specifications",
      type: "array",
      label: "规格 / Specifications",
      fields: [
        {
          name: "label",
          type: "text",
          label: "标签 / Label",
          required: true,
        },
        {
          name: "value",
          type: "text",
          label: "值 / Value",
          required: true,
        },
      ],
    },
    {
      name: "care_notes",
      type: "textarea",
      label: "护理说明 / Care Notes",
    },
    {
      name: "video_url",
      type: "text",
      label: "视频 URL / Video URL",
    },
    {
      name: "image_blocks",
      type: "array",
      label: "图片 / Images",
      fields: [
        {
          name: "image",
          type: "upload",
          label: "图片 / Image",
          relationTo: "media",
        },
        {
          name: "title",
          type: "text",
          label: "标题 / Title",
        },
        {
          name: "description",
          type: "textarea",
          label: "描述 / Description",
        },
      ],
    },
    {
      name: "seo",
      type: "group",
      label: "SEO / SEO",
      fields: [
        {
          name: "meta_title",
          type: "text",
          label: "Meta 标题 / Meta Title",
        },
        {
          name: "meta_description",
          type: "textarea",
          label: "Meta 描述 / Meta Description",
        },
        {
          name: "og_image",
          type: "upload",
          label: "Open Graph 图片 / Open Graph Image",
          relationTo: "media",
        },
      ],
    },
  ],
}
