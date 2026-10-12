import { defineConfig } from "@medusajs/framework/utils"

module.exports = defineConfig({
  modules: [
    {
      resolve: "./src/modules/procurement",
    },
  ],
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      authCors: process.env.AUTH_CORS || "http://localhost:7020",
      storeCors: process.env.STORE_CORS || "http://localhost:7000",
      adminCors: process.env.ADMIN_CORS || "http://localhost:7020",
      jwtSecret: process.env.JWT_SECRET || "procurement-plugin-dev-secret",
      cookieSecret:
        process.env.COOKIE_SECRET || "procurement-plugin-dev-cookie-secret",
    },
  },
})
