import { FixedToolbarFeature, lexicalEditor } from "@payloadcms/richtext-lexical"
import type { Access, CollectionConfig, PayloadRequest } from "payload"

const getStorefrontRevalidationUrl = () => {
  const configuredUrl = process.env.STOREFRONT_REVALIDATE_URL?.trim()

  if (configuredUrl) {
    return configuredUrl
  }

  const protocol = process.env.PUBLIC_PROTOCOL || "http"
  const host = process.env.PUBLIC_HOST || "127.0.0.1"

  return `${protocol}://${host}:8010/api/revalidate`
}

const revalidateArticlePages = async ({
  currentSlug,
  previousSlug,
  payload,
}: {
  currentSlug?: string | null
  previousSlug?: string | null
  payload: PayloadRequest["payload"]
}) => {
  const secret = process.env.REVALIDATE_SECRET?.trim()

  if (!secret) {
    payload.logger.warn(
      "Skipping Storefront article cache revalidation because REVALIDATE_SECRET is not configured in the CMS environment."
    )
    return
  }

  const slugs = Array.from(
    new Set([currentSlug, previousSlug].filter((slug): slug is string => Boolean(slug)))
  )
  const paths = [
    "/us",
    "/us/articles",
    "/sitemap.xml",
    ...slugs.map((slug) => `/us/articles/${slug}`),
  ]

  try {
    const response = await fetch(getStorefrontRevalidationUrl(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(5000),
      body: JSON.stringify({
        tags: [
          "payload-articles",
          ...slugs.map((slug) => `payload-article-${slug}`),
        ],
        paths,
      }),
    })

    if (!response.ok) {
      payload.logger.warn(
        `Storefront article cache revalidation failed with HTTP ${response.status}.`
      )
    }
  } catch (error) {
    payload.logger.warn({
      err: error,
      msg: "Storefront article cache revalidation request failed.",
    })
  }
}

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

export const Articles: CollectionConfig = {
  slug: "articles",
  access: {
    read: publishedOrAuthenticated,
  },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        await revalidateArticlePages({
          currentSlug: doc.slug,
          previousSlug: previousDoc?.slug,
          payload: req.payload,
        })

        return doc
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        await revalidateArticlePages({
          previousSlug: doc.slug,
          payload: req.payload,
        })

        return doc
      },
    ],
  },
  admin: {
    defaultColumns: ["title", "author", "status", "published_at", "updatedAt"],
    group: {
      en: "Content",
      zh: "内容",
      "zh-TW": "內容",
    },
    useAsTitle: "title",
  },
  labels: {
    singular: {
      en: "Article",
      zh: "文章",
      "zh-TW": "文章",
    },
    plural: {
      en: "Articles",
      zh: "文章",
      "zh-TW": "文章",
    },
  },
  fields: [
    {
      name: "status",
      type: "select",
      defaultValue: "draft",
      label: {
        en: "Status",
        zh: "状态",
        "zh-TW": "狀態",
      },
      options: [
        {
          label: {
            en: "Draft",
            zh: "草稿",
            "zh-TW": "草稿",
          },
          value: "draft",
        },
        {
          label: {
            en: "Published",
            zh: "已发布",
            "zh-TW": "已發布",
          },
          value: "published",
        },
      ],
      required: true,
    },
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
      name: "author",
      type: "text",
      admin: {
        description: {
          en: "Public byline displayed with the article. Do not enter a private account email.",
          zh: "文章公开显示的作者署名，请勿填写后台账号邮箱。",
          "zh-TW": "文章公開顯示的作者署名，請勿填寫後台帳號電子郵件。",
        },
      },
      defaultValue: "PetBoxNest Editorial Team",
      label: {
        en: "Author",
        zh: "作者",
        "zh-TW": "作者",
      },
      required: true,
    },
    {
      name: "slug",
      type: "text",
      admin: {
        description: {
          en: "URL-friendly article identifier, for example training-guide.",
          zh: "文章 URL 标识，例如 training-guide。",
          "zh-TW": "文章 URL 識別，例如 training-guide。",
        },
      },
      index: true,
      label: {
        en: "Slug",
        zh: "URL 标识",
        "zh-TW": "URL 識別",
      },
      required: true,
      unique: true,
    },
    {
      name: "excerpt",
      type: "textarea",
      label: {
        en: "Excerpt",
        zh: "摘要",
        "zh-TW": "摘要",
      },
    },
    {
      name: "hero_image",
      type: "upload",
      label: {
        en: "Hero image",
        zh: "封面图",
        "zh-TW": "封面圖",
      },
      relationTo: "media",
    },
    {
      name: "hero_image_url",
      type: "text",
      admin: {
        description: {
          en: "Optional remote image URL. Use this when the image is hosted online instead of uploaded to Media.",
          zh: "可选的在线图片地址。如果图片已经托管在线，可以填写这里，不必上传到媒体库。",
          "zh-TW": "可選的線上圖片地址。如果圖片已託管在線上，可以填寫這裡，不必上傳到媒體庫。",
        },
        placeholder: "https://example.com/article-cover.jpg",
      },
      label: {
        en: "Hero image URL",
        zh: "在线封面图地址",
        "zh-TW": "線上封面圖地址",
      },
    },
    {
      name: "content",
      type: "richText",
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          FixedToolbarFeature(),
        ],
      }),
      label: {
        en: "Content",
        zh: "正文",
        "zh-TW": "正文",
      },
      required: true,
    },
    {
      name: "related_products",
      type: "relationship",
      admin: {
        description: {
          en: "Optional product story entries to associate with this article.",
          zh: "可选：关联到这篇文章的产品内容增强项。",
          "zh-TW": "可選：關聯到這篇文章的產品內容增強項。",
        },
      },
      hasMany: true,
      label: {
        en: "Related products",
        zh: "相关产品",
        "zh-TW": "相關產品",
      },
      relationTo: "product-enhancements",
    },
    {
      name: "published_at",
      type: "date",
      admin: {
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
      label: {
        en: "Published at",
        zh: "发布时间",
        "zh-TW": "發布時間",
      },
    },
    {
      name: "seo",
      type: "group",
      fields: [
        {
          name: "meta_title",
          type: "text",
          label: {
            en: "Meta title",
            zh: "Meta 标题",
            "zh-TW": "Meta 標題",
          },
        },
        {
          name: "meta_description",
          type: "textarea",
          label: {
            en: "Meta description",
            zh: "Meta 描述",
            "zh-TW": "Meta 描述",
          },
        },
        {
          name: "og_image",
          type: "upload",
          label: {
            en: "Open Graph image",
            zh: "分享图",
            "zh-TW": "分享圖",
          },
          relationTo: "media",
        },
      ],
      label: "SEO",
    },
  ],
}
