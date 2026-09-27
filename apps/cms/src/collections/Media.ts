import type { CollectionConfig } from "payload"

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
  },
  admin: {
    defaultColumns: [
      "filename",
      "preview",
      "alt",
      "mimeType",
      "filesize",
      "updatedAt",
    ],
    useAsTitle: "alt",
  },
  fields: [
    {
      name: "preview",
      type: "ui",
      label: "缩略图 / Thumbnail",
      admin: {
        components: {
          Cell: "/admin/components/MediaPreviewCell#MediaPreviewCell",
        },
      },
    },
    {
      name: "alt",
      type: "text",
      required: true,
    },
  ],
  upload: {
    pasteURL: {
      allowList: [
        {
          hostname: "cdn.larumsport.com",
          protocol: "https",
        },
        {
          hostname: "media.6769.net",
          protocol: "https",
        },
        {
          hostname: "s3.6769.net",
          protocol: "https",
        },
      ],
    },
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 300,
        position: "centre",
      },
      {
        name: "productStory",
        width: 1200,
        height: 800,
        position: "centre",
      },
    ],
  },
}
