const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const vm = require("node:vm")
const ts = require("typescript")
const crypto = require("node:crypto")

function load(relative, imports = {}, globals = {}, env = {}) {
  const source = fs.readFileSync(path.resolve(__dirname, relative), "utf8")
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText
  const exports = {}
  vm.runInNewContext(compiled, {
    exports, URL, Response, AbortSignal, console, process: { env },
    require(name) {
      if (name === "server-only") return {}
      if (name in imports) return imports[name]
      throw new Error(`Unexpected import: ${name}`)
    },
    ...globals,
  })
  return exports
}

const token = "a".repeat(43)
const dataFile = "../src/lib/data/newsletter-link.ts"
function data(fetch) {
  return load(dataFile, { "@lib/util/public-url": { getPayloadServerUrl: () => "http://cms.internal:7010" } }, { fetch })
}

test("confirmation and unsubscribe use private no-cache CMS requests", async () => {
  for (const [action, status] of [["confirm", "confirmed"], ["unsubscribe", "unsubscribed"]]) {
    const loaded = data(async (url, options) => {
      assert.equal(url.origin, "http://cms.internal:7010")
      assert.equal(url.pathname, `/api/newsletter-subscribers/${action}`)
      assert.equal(url.searchParams.get("token"), token)
      assert.equal(url.searchParams.get("response"), "json")
      assert.equal(options.cache, "no-store")
      assert.equal(options.redirect, "error")
      assert(options.signal)
      return Response.json({ status })
    })
    assert.equal(await loaded.processNewsletterLink(action, token), status)
  }
})

test("missing, malformed and oversized tokens never contact CMS", async () => {
  const loaded = data(() => { throw Error("must not fetch") })
  for (const value of [null, "", "short", "a".repeat(10000), '"<script>']) {
    assert.equal(await loaded.processNewsletterLink("confirm", value), "invalid")
  }
})

test("CMS failures never become success or expose an upstream error", async () => {
  for (const fetch of [
    async () => { throw Error("http://cms.internal/private-token") },
    async () => new Response("unavailable", { status: 503 }),
    async () => new Response("not json"),
    async () => Response.json({ status: "unsubscribed" }),
  ]) assert.equal(await data(fetch).processNewsletterLink("confirm", token), "error")
  assert.equal(await data(async () => Response.json({ status: "invalid" })).processNewsletterLink("confirm", token), "invalid")
})

test("route redirects only to the shop, strips tokens and sends privacy headers", async () => {
  const loaded = load("../src/app/[countryCode]/(main)/newsletter/[action]/route.ts", {
    "@lib/data/newsletter-link": { processNewsletterLink: async () => "confirmed" },
    "next/server": { NextResponse: { redirect: (url, status) => new Response(null, { status, headers: { Location: url.toString() } }) } },
  })
  const url = new URL(`https://www.petboxnest.com/us/newsletter/confirm?token=${token}&next=https://evil.example`)
  const response = await loaded.GET({ url: url.href, nextUrl: url }, { params: Promise.resolve({ countryCode: "us", action: "confirm" }) })
  assert.equal(response.status, 303)
  assert.equal(response.headers.get("Location"), "https://www.petboxnest.com/us?newsletter=confirmed#early-access")
  assert.equal(response.headers.get("Referrer-Policy"), "no-referrer")
  assert.match(response.headers.get("Cache-Control"), /no-store/)
  assert.equal(response.headers.get("X-Robots-Tag"), "noindex, nofollow")
})

function collection(fetch) {
  return load("../../cms/src/collections/NewsletterSubscribers.ts", {
    "node:crypto": crypto,
    "../emails/newsletter-confirmation": {
      renderNewsletterConfirmation: ({ confirmUrl, unsubscribeUrl }) => ({ html: `${confirmUrl} ${unsubscribeUrl}`, text: `${confirmUrl} ${unsubscribeUrl}` }),
    },
  }, { fetch }, {
    NEXT_PUBLIC_BASE_URL: "https://www.petboxnest.com",
    PAYLOAD_PUBLIC_SERVER_URL: "https://cms.internal",
    RESEND_API_KEY: "test-only", RESEND_FROM_EMAIL: "updates@example.test",
  }).NewsletterSubscribers
}

test("new confirmation emails use the shop domain for both links", async () => {
  let sent
  const config = collection(async (_url, options) => {
    sent = JSON.parse(options.body)
    return Response.json({ id: "test-message" })
  })
  const subscribe = config.endpoints.find((endpoint) => endpoint.path === "/subscribe")
  const response = await subscribe.handler({
    headers: new Headers(), json: async () => ({ email: "preview@example.test", consent: true }),
    payload: { find: async () => ({ docs: [] }), create: async () => ({ id: 1 }), update: async () => ({ id: 1 }) },
  })
  assert.equal(response.status, 201)
  assert.equal(sent.subject, "Confirm your PetBoxNest updates")
  assert.match(sent.html, /https:\/\/www\.petboxnest\.com\/us\/newsletter\/confirm\?token=/)
  assert.match(sent.html, /https:\/\/www\.petboxnest\.com\/us\/newsletter\/unsubscribe\?token=/)
  assert(!sent.html.includes("cms.internal"))
})

test("CMS supports private JSON results and keeps legacy email redirects", async () => {
  const config = collection(() => { throw Error("must not send email") })
  for (const action of ["confirm", "unsubscribe"]) {
    const endpoint = config.endpoints.find((item) => item.path === `/${action}`)
    const status = action === "confirm" ? "confirmed" : "unsubscribed"
    const updates = []
    const payload = {
      find: async () => ({ docs: [{ id: 1, confirmationExpiresAt: "2099-01-01T00:00:00Z" }] }),
      update: async (input) => { updates.push(input.data); return {} },
    }
    const response = await endpoint.handler({ url: `https://cms.internal/api/newsletter-subscribers/${action}?token=${token}&response=json`, payload })
    assert.equal((await response.json()).status, status)
    assert.equal(response.headers.get("Location"), null)
    assert.equal(updates[0].confirmationTokenHash, null)
    const legacy = await endpoint.handler({ url: `https://cms.internal/api/newsletter-subscribers/${action}?token=${token}`, payload })
    assert.equal(legacy.status, 302)
    assert.match(legacy.headers.get("Location"), new RegExp(`newsletter=${status}`))
    const invalid = await endpoint.handler({ url: `https://cms.internal/api/newsletter-subscribers/${action}?response=json` })
    assert.equal((await invalid.json()).status, "invalid")
  }
  const confirm = config.endpoints.find((item) => item.path === "/confirm")
  const expired = await confirm.handler({
    url: `https://cms.internal/api/newsletter-subscribers/confirm?token=${token}&response=json`,
    payload: { find: async () => ({ docs: [{ confirmationExpiresAt: "2000-01-01T00:00:00Z" }] }), update: async () => { throw Error("expired token must not update") } },
  })
  assert.equal((await expired.json()).status, "invalid")
})
