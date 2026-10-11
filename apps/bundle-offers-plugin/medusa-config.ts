import { defineConfig } from "@medusajs/framework/utils"

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      authCors: process.env.AUTH_CORS || "http://localhost:7020",
      storeCors: process.env.STORE_CORS || "http://localhost:7000",
      adminCors: process.env.ADMIN_CORS || "http://localhost:7020",
      jwtSecret: process.env.JWT_SECRET || "bundle-offers-plugin-dev-secret",
      cookieSecret:
        process.env.COOKIE_SECRET || "bundle-offers-plugin-dev-cookie-secret",
    },
  },
})
