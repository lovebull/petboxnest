import { getLocaleHeader } from "@lib/util/get-locale-header"
import { expandPublicUrl, getPublicUrl } from "@lib/util/public-url"
import Medusa, { FetchArgs, FetchInput } from "@medusajs/js-sdk"

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

const originalFetch = sdk.client.fetch.bind(sdk.client)

sdk.client.fetch = async <T>(
  input: FetchInput,
  init?: FetchArgs
): Promise<T> => {
  const headers = init?.headers ?? {}
  let localeHeader: Record<string, string | null> | undefined
  try {
    localeHeader = await getLocaleHeader()
    headers["x-medusa-locale"] ??= localeHeader["x-medusa-locale"]
  } catch {}

  const newHeaders = {
    ...localeHeader,
    ...headers,
  }
  init = {
    ...init,
    headers: newHeaders,
  }
  return originalFetch(input, init)
}
