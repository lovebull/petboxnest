import type { CollectionConfig } from "payload"

export const OnlineImages: CollectionConfig = {
  slug: "online-images",
  access: {
    read: () => true,
  },
  admin: {
    defaultColumns: ["title", "image_url", "updatedAt"],
    group: {
      en: "Content",
      zh: "内容",
      "zh-TW": "內容",
    },
    useAsTitle: "title",
  },
  labels: {
    singular: {
      en: "Online Image",
      zh: "在线图片",
      "zh-TW": "線上圖片",
    },
    plural: {
      en: "Online Images",
      zh: "在线图片",
      "zh-TW": "線上圖片",
    },
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: {
        en: "Title",
        zh: "标题",
        "zh-TW": "標題",
      },
      required: true,
    },
    {
      name: "image_url",
      type: "text",
      admin: {
        description: {
          en: "Remote image URL. Use this for images hosted outside Payload Media.",
          zh: "在线图片地址。用于填写托管在 Payload Media 之外的图片。",
          "zh-TW": "線上圖片地址。用於填寫託管在 Payload Media 之外的圖片。",
        },
        placeholder: "https://example.com/image.jpg",
      },
      label: {
        en: "Image URL",
        zh: "在线图片地址",
        "zh-TW": "線上圖片地址",
      },
      required: true,
    },
    {
      name: "description",
      type: "textarea",
      label: {
        en: "Description",
        zh: "描述",
        "zh-TW": "描述",
      },
    },
    {
      name: "alt",
      type: "text",
      admin: {
        description: {
          en: "Optional image alt text for accessibility and SEO.",
          zh: "可选的图片 Alt 文本，用于无障碍访问和 SEO。",
          "zh-TW": "可選的圖片 Alt 文字，用於無障礙存取和 SEO。",
        },
      },
      label: {
        en: "Alt",
        zh: "Alt",
        "zh-TW": "Alt",
      },
    },
  ],
}
