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
    group: "Medusa Enhancements",
    useAsTitle: "title",
  },
  fields: [
    {
      name: "status",
      type: "select",
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
      ],
      required: true,
    },
    {
      name: "medusa_product_id",
      type: "text",
      admin: {
        description: "Optional Medusa product ID, for example prod_01...",
      },
      index: true,
      unique: true,
    },
    {
      name: "medusa_product_handle",
      type: "text",
      admin: {
        description: "Medusa product handle used by the storefront URL.",
      },
      index: true,
      required: true,
      unique: true,
    },
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "subtitle",
      type: "textarea",
    },
    {
      name: "hero_eyebrow",
      type: "text",
      label: "Hero eyebrow",
    },
    {
      name: "highlights",
      type: "array",
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
        },
        {
          name: "description",
          type: "textarea",
        },
      ],
      maxRows: 6,
    },
    {
      name: "story_sections",
      type: "array",
      fields: [
        {
          name: "heading",
          type: "text",
          required: true,
        },
        {
          name: "body",
          type: "textarea",
          required: true,
        },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
        },
      ],
    },
    {
      name: "specifications",
      type: "array",
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
        },
        {
          name: "value",
          type: "text",
          required: true,
        },
      ],
    },
    {
      name: "care_notes",
      type: "textarea",
      label: "Care notes",
    },
    {
      name: "video_url",
      type: "text",
      label: "Video URL",
    },
    {
      name: "seo",
      type: "group",
      fields: [
        {
          name: "meta_title",
          type: "text",
          label: "Meta title",
        },
        {
          name: "meta_description",
          type: "textarea",
          label: "Meta description",
        },
        {
          name: "og_image",
          type: "upload",
          label: "Open Graph image",
          relationTo: "media",
        },
      ],
    },
  ],
}
