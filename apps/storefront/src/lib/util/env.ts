import { expandPublicUrl, getPublicUrl } from "./public-url"

export const getBaseURL = () => {
  return expandPublicUrl(process.env.NEXT_PUBLIC_BASE_URL, getPublicUrl(8010))
}
