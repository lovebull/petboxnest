import { defineConfig } from "eslint/config"
import medusa from "@medusajs/eslint-plugin"

// export default defineConfig([...medusa.configs.recommended])
export default defineConfig([
  {
    ignores: ["apps/cms/**"],//根目录 ESLint 排除 CMS
  },
  ...medusa.configs.recommended,
])
