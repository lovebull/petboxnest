import { expandPublicUrl, getPublicUrl } from "@lib/util/public-url"
import Medusa from "@medusajs/js-sdk"

// Defaults to standard port for Medusa server
let MEDUSA_BACKEND_URL = getPublicUrl(8030)

if (process.env.MEDUSA_BACKEND_URL) {
  MEDUSA_BACKEND_URL = expandPublicUrl(
    process.env.MEDUSA_BACKEND_URL,
    MEDUSA_BACKEND_URL
  )
} else if (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) {
  MEDUSA_BACKEND_URL = expandPublicUrl(
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL,
    MEDUSA_BACKEND_URL
  )
}

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
//debug: process.env.NODE_ENV === "development",
  debug: false,
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})
