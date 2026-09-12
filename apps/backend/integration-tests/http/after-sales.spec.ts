import fs from "node:fs"
import path from "node:path"

const baseUrl = process.env.AFTER_SALES_TEST_BASE_URL || "http://127.0.0.1:7020"
const adminEmail = process.env.AFTER_SALES_TEST_ADMIN || "admin@example.com"
const adminPassword = process.env.AFTER_SALES_TEST_PASSWORD || "12345678"
const customerEmail = process.env.AFTER_SALES_TEST_CUSTOMER || adminEmail
const storefrontEnv = fs.readFileSync(
  path.resolve(process.cwd(), "../storefront/.env.local"),
  "utf8"
)
const publishableKey = storefrontEnv.match(
  /^NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=(.+)$/m
)?.[1]

const request = async (pathname: string, init?: RequestInit) => {
  const response = await fetch(`${baseUrl}${pathname}`, init)
  return {
    status: response.status,
    body: (await response.json().catch(() => ({}))) as Record<string, any>,
  }
}

describe("PetBoxNest after-sales HTTP API", () => {
  jest.setTimeout(60_000)

  it("protects customer routes and does not allow direct exchange creation", async () => {
    expect(publishableKey).toBeTruthy()
    const headers = {
      "x-publishable-api-key": publishableKey!,
      "content-type": "application/json",
    }
    expect(
      (await request("/store/orders/order_missing/after-sales", { headers })).status
    ).toBe(401)
    const auth = await request("/auth/customer/emailpass", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: customerEmail, password: adminPassword }),
    })
    expect(auth.status).toBe(200)
    const exchange = await request("/store/orders/order_missing/after-sales", {
      method: "POST",
      headers: { ...headers, authorization: `Bearer ${auth.body.token}` },
      body: JSON.stringify({
        type: "exchange",
        reason_code: "changed_mind",
        items: [],
      }),
    })
    expect(exchange.status).toBe(400)
  })

  it("keeps guest lookup generic and keeps access tokens out of query strings", async () => {
    const headers = {
      "x-publishable-api-key": publishableKey!,
      "content-type": "application/json",
    }
    const code = await request("/store/after-sales/guest/request-code", {
      method: "POST",
      headers,
      body: JSON.stringify({
        order_reference: "does-not-exist",
        email: "nobody@example.com",
      }),
    })
    expect(code.status).toBe(202)
    const legacyGet = await request(
      `/store/after-sales/guest/order?order_id=order_missing&access_token=${"a".repeat(64)}`,
      { headers }
    )
    expect([404, 405]).toContain(legacyGet.status)
    const protectedLookup = await request("/store/after-sales/guest/order", {
      method: "POST",
      headers,
      body: JSON.stringify({
        order_id: "order_missing",
        access_token: "a".repeat(64),
      }),
    })
    expect(protectedLookup.status).toBe(401)
  })

  it("supports database-side admin search pagination", async () => {
    const auth = await request("/auth/user/emailpass", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: adminEmail, password: adminPassword }),
    })
    expect(auth.status).toBe(200)
    const result = await request("/admin/after-sales?q=PBN-AS&page=1&limit=20", {
      headers: { authorization: `Bearer ${auth.body.token}` },
    })
    expect(result.status).toBe(200)
    expect(Array.isArray(result.body.requests)).toBe(true)
    expect(result.body.page).toBe(1)
    expect(result.body.page_size).toBe(20)
  })
})
