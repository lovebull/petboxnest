import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { postgresAdapter } from "@payloadcms/db-postgres"
import { lexicalEditor } from "@payloadcms/richtext-lexical"
import { s3Storage } from "@payloadcms/storage-s3"
import { en } from "@payloadcms/translations/languages/en"
import { zh } from "@payloadcms/translations/languages/zh"
import { zhTw } from "@payloadcms/translations/languages/zhTw"
import { buildConfig } from "payload"
import sharp from "sharp"

import { Articles } from "./collections/Articles"
import { ContactSubmissions } from "./collections/ContactSubmissions"
import { Media } from "./collections/Media"
import { NewsletterSubscribers } from "./collections/NewsletterSubscribers"
import { OnlineImages } from "./collections/OnlineImages"
import { PasswordResetRequests } from "./collections/PasswordResetRequests"
import { ProductEnhancements } from "./collections/ProductEnhancements"
import { Users } from "./collections/Users"

function loadEnvFile(envPath: string) {
  if (!fs.existsSync(envPath)) {
    return
  }

  const entries = fs.readFileSync(envPath, "utf8").split(/\r?\n/)

  for (const entry of entries) {
    const line = entry.trim()

    if (!line || line.startsWith("#") || !line.includes("=")) {
      continue
    }

    const [key, ...valueParts] = line.split("=")
    const value = valueParts.join("=").replace(/^['"]|['"]$/g, "")

    if (key && !process.env[key]) {
      process.env[key] = value
    }
  }
}

loadEnvFile(path.resolve(process.cwd(), ".env.local"))

// Local monorepo development already keeps the Resend credentials in the
// Medusa app. Reuse only missing values without copying secrets into another
// file.
if (process.env.NODE_ENV !== "production") {
  loadEnvFile(path.resolve(process.cwd(), "../backend/.env"))
}

// The CMS and Storefront use the same signing secret for on-demand cache
// revalidation. Explicit process/CMS variables still take precedence.
loadEnvFile(path.resolve(process.cwd(), "../storefront/.env.local"))

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const isProduction = process.env.NODE_ENV === "production"
const publicProtocol = process.env.PUBLIC_PROTOCOL || "http"
const publicHost = process.env.PUBLIC_HOST || "127.0.0.1"
const publicUrl = (port: number) => `${publicProtocol}://${publicHost}:${port}`
const expandPublicUrl = (value: string | undefined, fallback: string) => {
  if (!value) {
    return fallback
  }

  return value
    .replaceAll("$PUBLIC_PROTOCOL", publicProtocol)
    .replaceAll("${PUBLIC_PROTOCOL}", publicProtocol)
    .replaceAll("$PUBLIC_HOST", publicHost)
    .replaceAll("${PUBLIC_HOST}", publicHost)
}

const publicServerURL =
  expandPublicUrl(process.env.PAYLOAD_PUBLIC_SERVER_URL, publicUrl(7010))
const csrfOrigins =
  isProduction
    ? [
        publicServerURL,
        "http://127.0.0.1:7010",
        publicUrl(7010),
      ]
    : []

export default buildConfig({
  admin: {
    user: Users.slug,
    components: {
      afterNavLinks: ["/admin/components/WhatsNewNavLink#WhatsNewNavLink"],
      views: {
        whatsNew: {
          Component: "/admin/views/WhatsNew#WhatsNewView",
          path: "/whats-new",
          meta: {
            title: "What's New",
          },
        },
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    OnlineImages,
    ProductEnhancements,
    Articles,
    NewsletterSubscribers,
    ContactSubmissions,
    PasswordResetRequests,
  ],
  plugins: [
    s3Storage({
      enabled: Boolean(
        process.env.PAYLOAD_S3_BUCKET &&
          process.env.PAYLOAD_S3_ACCESS_KEY_ID &&
          process.env.PAYLOAD_S3_SECRET_ACCESS_KEY
      ),
      collections: {
        media: {
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => {
            if (filename.startsWith("http://") || filename.startsWith("https://")) {
              return filename
            }

            const publicUrl = process.env.PAYLOAD_S3_PUBLIC_URL?.replace(
              /\/$/,
              ""
            )
            const key = prefix ? `${prefix}/${filename}` : filename
            const normalizedKey = key.replace(/^\/+/, "")

            return publicUrl ? `${publicUrl}/${normalizedKey}` : `/${normalizedKey}`
          },
        },
      },
      bucket: process.env.PAYLOAD_S3_BUCKET || "",
      config: {
        credentials: {
          accessKeyId: process.env.PAYLOAD_S3_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.PAYLOAD_S3_SECRET_ACCESS_KEY || "",
        },
        endpoint: process.env.PAYLOAD_S3_ENDPOINT,
        forcePathStyle: true,
        region: process.env.PAYLOAD_S3_REGION || "us-east-1",
      },
    }),
  ],
  cookiePrefix: "petboxnest-payload",
  cors: [
    expandPublicUrl(process.env.NEXT_PUBLIC_BASE_URL, publicUrl(7000)),
    "http://127.0.0.1:7000",
    publicUrl(7000),
    "http://127.0.0.1:7010",
    publicUrl(7010),
  ],
  csrf: csrfOrigins,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
    },
  }),
  editor: lexicalEditor(),
  i18n: {
    fallbackLanguage: "en",
    supportedLanguages: {
      en,
      zh,
      "zh-TW": zhTw,
    },
  },
  secret: process.env.PAYLOAD_SECRET || "",
  serverURL: isProduction ? publicServerURL : "",
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
})
