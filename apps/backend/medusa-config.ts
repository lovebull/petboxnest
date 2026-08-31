import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const resendEnabled = Boolean(
  process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL
)

const publicProtocol = process.env.PUBLIC_PROTOCOL || "http"
const publicHost = process.env.PUBLIC_HOST || "127.0.0.1"
const publicUrl = (port: number, pathname = "") =>
  `${publicProtocol}://${publicHost}:${port}${pathname}`

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

module.exports = defineConfig({
  featureFlags: {
    view_configurations: true,
  },
  plugins: [
    {
      resolve: "@medusajs/loyalty-plugin",
      options: {},
    },
  ],
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    redisPrefix: "petboxnest:",
    http: {
      storeCors: expandPublicUrl(
        process.env.STORE_CORS,
        `http://localhost:8010,${publicUrl(8010)}`
      ),
      adminCors: expandPublicUrl(
        process.env.ADMIN_CORS,
        `http://localhost:8030,${publicUrl(8030)}`
      ),
      authCors: expandPublicUrl(
        process.env.AUTH_CORS,
        `http://localhost:8010,http://localhost:8030,${publicUrl(
          8010
        )},${publicUrl(8030)}`
      ),
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
    sessionOptions: {
      name: "petboxnest.sid",
      resave: false,
      rolling: true,
      saveUninitialized: false,
      ttl: 10 * 60 * 60 * 1000,
    },
    // The current Admin is accessed directly over HTTP by IP address.
    cookieOptions: {
      secure: false,
      sameSite: "lax",
      httpOnly: true,
      path: "/",
    },
  },
  modules: [
    {
      resolve: "./src/modules/cashback",
    },
    {
      resolve: "./src/modules/referral",
    },
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-s3",
            id: "s3",
            options: {
              file_url: process.env.S3_FILE_URL,
              access_key_id: process.env.S3_ACCESS_KEY_ID,
              secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
              region: process.env.S3_REGION || "us-east-1",
              bucket: process.env.S3_BUCKET,
              endpoint: process.env.S3_ENDPOINT,
              prefix: process.env.S3_PREFIX,
              additional_client_config: {
                forcePathStyle: true,
              },
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
        jobOptions: {
          removeOnComplete: {
            age: 3600,
            count: 1000,
          },
          removeOnFail: {
            age: 3600,
            count: 1000,
          },
        },
      },
    },
    {
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: {
        redis: {
          redisUrl: process.env.REDIS_URL,
        },
      },
    },
    {
      resolve: "@medusajs/medusa/locking",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/locking-redis",
            id: "locking-redis",
            is_default: true,
            options: {
              redisUrl: process.env.REDIS_URL,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/caching",
      options: {
        providers: [
          {
            resolve: "@medusajs/caching-redis",
            id: "caching-redis",
            is_default: true,
            options: {
              redisUrl: process.env.REDIS_URL,
              prefix: "petboxnest:",
            },
          },
        ],
      },
    },
    ...(resendEnabled
      ? [
          {
            resolve: "@medusajs/medusa/notification",
            options: {
              providers: [
                {
                  resolve: "./src/modules/resend",
                  id: "resend",
                  options: {
                    channels: ["email"],
                    api_key: process.env.RESEND_API_KEY,
                    from: process.env.RESEND_FROM_EMAIL,
                  },
                },
              ],
            },
          },
        ]
      : []),
  ],
})
