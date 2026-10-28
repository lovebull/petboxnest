const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const vm = require("node:vm")
const ts = require("typescript")
const path = require("node:path")

function loadDataModule(file, imports, env = {}, globals = {}) {
  const source = fs.readFileSync(
    path.join(__dirname, "../src/lib/data", file),
    "utf8"
  )
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText
  const exports = {}
  vm.runInNewContext(compiled, {
    exports,
    URLSearchParams,
    AbortController,
    Date,
    setTimeout,
    clearTimeout,
    process: { env },
    console: { error() {} },
    require(name) {
      if (name === "server-only") return {}
      if (name in imports) return imports[name]
      throw new Error(`Unexpected import ${name}`)
    },
    ...globals,
  })
  return exports
}

test("critical articles have a bounded 30-second timeout independent of optional requests", () => {
  const data = loadDataModule(
    "payload-fetch.ts",
    {},
    { PAYLOAD_REQUEST_TIMEOUT_MS: "5000" }
  )
  assert.equal(data.getPayloadArticleTimeoutMs(), 30000)
  assert.equal(data.getPayloadRequestTimeoutMs(), 5000)
  assert.equal(
    loadDataModule(
      "payload-fetch.ts",
      {},
      { PAYLOAD_ARTICLE_TIMEOUT_MS: "999999" }
    ).getPayloadArticleTimeoutMs(),
    45000
  )
})

function articles(fetchPayloadJson) {
  return loadDataModule("payload-articles.ts", {
    react: {
      cache(fn) {
        const values = new Map()
        return (slug) => {
          if (!values.has(slug)) values.set(slug, fn(slug))
          return values.get(slug)
        }
      },
    },
    "./payload-fetch": {
      fetchPayloadJson,
      getPayloadArticleTimeoutMs: () => 30000,
      getPayloadRequestTimeoutMs: () => 5000,
    },
    "@lib/util/public-url": { getPayloadServerUrl: () => "http://cms.test" },
  })
}

test("metadata, layout and body use the same memoized article reader", async () => {
  let calls = 0
  const data = articles(async (_, options) => {
    calls++
    assert.equal(options.timeoutMs, 30000)
    return { docs: [{ id: 1, slug: "story", title: "Story" }] }
  })
  const result = await Promise.all([
    data.getArticleBySlug("story"),
    data.getArticleBySlug("story"),
    data.getArticleBySlug("story"),
  ])
  assert.equal(calls, 1)
  assert.equal(result[0], result[2])
})

test("optional recommendations fail independently, but essential article failures propagate", async () => {
  const failure = new Error("CMS unavailable")
  const data = articles(async () => {
    throw failure
  })
  assert.equal((await data.getLatestArticles({ optional: true })).length, 0)
  await assert.rejects(
    data.getArticleBySlug("story"),
    (error) => error === failure
  )
  await assert.rejects(data.getLatestArticles(), (error) => error === failure)
})

test("the story gate propagates CMS failure before it renders the streaming store shell", async () => {
  const failure = new Error("CMS unavailable")
  let shellRendered = false
  const layout = loadDataModule(
    "../../app/[countryCode]/(stories)/articles/[slug]/layout.tsx",
    {
      "react/jsx-runtime": {
        jsx() {
          shellRendered = true
        },
      },
      "next/navigation": {
        notFound() {
          throw new Error("not found")
        },
      },
      "@lib/data/payload-articles": {
        async getArticleBySlug() {
          throw failure
        },
      },
      "../../../(main)/layout": { default() {} },
    }
  )
  await assert.rejects(
    layout.default({
      params: Promise.resolve({ slug: "story", countryCode: "us" }),
      children: null,
    }),
    (error) => error === failure
  )
  assert.equal(shellRendered, false)
})
