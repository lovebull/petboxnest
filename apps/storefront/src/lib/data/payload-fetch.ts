import "server-only"

export type PayloadResource =
  | "articles"
  | "article"
  | "product-enhancement"
  | "online-images"

export type PayloadRequestErrorKind =
  | "timeout"
  | "network"
  | "http"
  | "invalid_response"

type NextFetchInit = RequestInit & {
  next?: {
    revalidate?: number | false
    tags?: string[]
  }
}

type FetchPayloadJsonOptions = NextFetchInit & {
  resource: PayloadResource
  timeoutMs?: number
}

const DEFAULT_REQUEST_TIMEOUT_MS = 5_000
const DEFAULT_PAGINATION_TIMEOUT_MS = 15_000
const MIN_TIMEOUT_MS = 1_000
const MAX_TIMEOUT_MS = 15_000
const MAX_PAGINATION_TIMEOUT_MS = 45_000

function readTimeout(
  value: string | undefined,
  fallback: number,
  maximum: number
) {
  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    return fallback
  }

  return Math.min(maximum, Math.max(MIN_TIMEOUT_MS, Math.trunc(parsed)))
}

export function getPayloadRequestTimeoutMs() {
  return readTimeout(
    process.env.PAYLOAD_REQUEST_TIMEOUT_MS,
    DEFAULT_REQUEST_TIMEOUT_MS,
    MAX_TIMEOUT_MS
  )
}

export function getPayloadPaginationTimeoutMs() {
  return readTimeout(
    process.env.PAYLOAD_PAGINATION_TIMEOUT_MS,
    DEFAULT_PAGINATION_TIMEOUT_MS,
    MAX_PAGINATION_TIMEOUT_MS
  )
}

export class PayloadRequestError extends Error {
  readonly kind: PayloadRequestErrorKind
  readonly resource: PayloadResource
  readonly status?: number
  readonly timeoutMs: number
  readonly durationMs: number

  constructor({
    kind,
    resource,
    status,
    timeoutMs,
    durationMs,
  }: {
    kind: PayloadRequestErrorKind
    resource: PayloadResource
    status?: number
    timeoutMs: number
    durationMs: number
  }) {
    super(`Payload ${resource} request failed (${kind})`)
    this.name = "PayloadRequestError"
    this.kind = kind
    this.resource = resource
    this.status = status
    this.timeoutMs = timeoutMs
    this.durationMs = durationMs
  }
}

export function reportPayloadRequestError(error: PayloadRequestError) {
  console.error("[payload-request-failed]", {
    resource: error.resource,
    kind: error.kind,
    status: error.status,
    timeout_ms: error.timeoutMs,
    duration_ms: error.durationMs,
  })
}

export async function fetchPayloadJson<T>(
  url: string,
  {
    resource,
    timeoutMs = getPayloadRequestTimeoutMs(),
    ...init
  }: FetchPayloadJsonOptions
): Promise<T> {
  const controller = new AbortController()
  const startedAt = Date.now()
  let phase: "request" | "response" = "request"
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new PayloadRequestError({
        kind: "http",
        resource,
        status: response.status,
        timeoutMs,
        durationMs: Date.now() - startedAt,
      })
    }

    phase = "response"

    try {
      return (await response.json()) as T
    } catch (error) {
      if (controller.signal.aborted) {
        throw error
      }

      throw new PayloadRequestError({
        kind: "invalid_response",
        resource,
        timeoutMs,
        durationMs: Date.now() - startedAt,
      })
    }
  } catch (error) {
    let kind: PayloadRequestErrorKind = "network"

    if (controller.signal.aborted) {
      kind = "timeout"
    } else if (phase === "response") {
      kind = "invalid_response"
    }

    const requestError =
      error instanceof PayloadRequestError
        ? error
        : new PayloadRequestError({
            kind,
            resource,
            timeoutMs,
            durationMs: Date.now() - startedAt,
          })

    reportPayloadRequestError(requestError)
    throw requestError
  } finally {
    clearTimeout(timer)
  }
}
