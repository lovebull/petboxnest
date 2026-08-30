const baseProtocol = process.env.PUBLIC_PROTOCOL || "http"
const baseHost = process.env.PUBLIC_HOST || "127.0.0.1"

export const publicProtocol = (
  process.env.NEXT_PUBLIC_PUBLIC_PROTOCOL ||
  baseProtocol
).replaceAll("$PUBLIC_PROTOCOL", baseProtocol)

export const publicHost = (
  process.env.NEXT_PUBLIC_PUBLIC_HOST ||
  baseHost
).replaceAll("$PUBLIC_HOST", baseHost)

export const getPublicUrl = (port: number, pathname = "") => {
  return `${publicProtocol}://${publicHost}:${port}${pathname}`
}

export const expandPublicUrl = (value: string | undefined, fallback: string) => {
  if (!value) {
    return fallback
  }

  return value
    .replaceAll("$PUBLIC_PROTOCOL", publicProtocol)
    .replaceAll("${PUBLIC_PROTOCOL}", publicProtocol)
    .replaceAll("$PUBLIC_HOST", publicHost)
    .replaceAll("${PUBLIC_HOST}", publicHost)
    .replaceAll("$NEXT_PUBLIC_PUBLIC_PROTOCOL", publicProtocol)
    .replaceAll("${NEXT_PUBLIC_PUBLIC_PROTOCOL}", publicProtocol)
    .replaceAll("$NEXT_PUBLIC_PUBLIC_HOST", publicHost)
    .replaceAll("${NEXT_PUBLIC_PUBLIC_HOST}", publicHost)
}

export const getPayloadServerUrl = () =>
  expandPublicUrl(
    process.env.PAYLOAD_SERVER_URL || process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL,
    getPublicUrl(8020)
  )
