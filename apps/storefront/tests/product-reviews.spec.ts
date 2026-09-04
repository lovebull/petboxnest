import { expect, test } from "@playwright/test"
import fs from "node:fs"
import path from "node:path"
import { Client } from "pg"

const storefrontUrl = process.env.PLAYWRIGHT_STOREFRONT_URL || "http://127.0.0.1:7000"
const backendUrl = process.env.PLAYWRIGHT_BACKEND_URL || "http://127.0.0.1:7020"
const productHandle = "12-pack-badminton-shuttlecocks-b0bff172kd"
const email = process.env.PRODUCT_REVIEW_TEST_CUSTOMER || "admin@example.com"
const password = process.env.PRODUCT_REVIEW_TEST_PASSWORD || "123456"

const parseEnv = (file: string) =>
  Object.fromEntries(
    fs
      .readFileSync(file, "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=")
        return [line.slice(0, separator), line.slice(separator + 1)]
      })
  )

const storefrontEnv = parseEnv(path.resolve(process.cwd(), ".env.local"))
const backendEnv = parseEnv(path.resolve(process.cwd(), "../backend/.env"))
const publishableKey = storefrontEnv.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

let reviewId = ""
let productId = ""
let customerToken = ""
let adminToken = ""

const json = async (response: Response) => {
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(`${response.status}: ${JSON.stringify(body)}`)
  }
  return body
}

test.beforeAll(async () => {
  const customer = await json(
    await fetch(`${backendUrl}/auth/customer/emailpass`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
  )
  const admin = await json(
    await fetch(`${backendUrl}/auth/user/emailpass`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
  )
  customerToken = customer.token
  adminToken = admin.token
  const products = await json(
    await fetch(`${backendUrl}/store/products?handle=${productHandle}&fields=id`, {
      headers: { "x-publishable-api-key": publishableKey },
    })
  )
  productId = products.products[0].id
  const created = await json(
    await fetch(`${backendUrl}/store/customers/me/product-reviews`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${customerToken}`,
        "content-type": "application/json",
        "x-publishable-api-key": publishableKey,
      },
      body: JSON.stringify({
        product_id: productId,
        rating: 5,
        title: "Playwright responsive review",
        content:
          "This temporary review verifies the PetBoxNest desktop, tablet, and mobile layouts.",
      }),
    })
  )
  reviewId = created.review.id
  const adminHeaders = {
    authorization: `Bearer ${admin.token}`,
    "content-type": "application/json",
  }
  await json(
    await fetch(`${backendUrl}/admin/product-reviews/${reviewId}/status`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({ status: "approved" }),
    })
  )
  await json(
    await fetch(`${backendUrl}/admin/product-reviews/${reviewId}/reply`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({
        content: "Thanks for testing every PetBoxNest screen size.",
      }),
    })
  )
})

test.afterAll(async () => {
  if (!reviewId) return
  const client = new Client({ connectionString: backendEnv.DATABASE_URL })
  await client.connect()
  try {
    await client.query("begin")
    await client.query("delete from pbn_product_review_audit where review_id=$1", [reviewId])
    await client.query("delete from pbn_product_review_reply where review_id=$1", [reviewId])
    await client.query("delete from pbn_product_review where id=$1", [reviewId])
    await client.query(
      `update pbn_product_review_stats stats set
       average_rating=summary.average_rating,
       review_count=summary.review_count,
       rating_count_1=summary.rating_count_1,
       rating_count_2=summary.rating_count_2,
       rating_count_3=summary.rating_count_3,
       rating_count_4=summary.rating_count_4,
       rating_count_5=summary.rating_count_5,
       updated_at=now()
       from (
         select
           coalesce(avg(rating), 0)::numeric(3,2) as average_rating,
           count(*)::integer as review_count,
           count(*) filter (where rating=1)::integer as rating_count_1,
           count(*) filter (where rating=2)::integer as rating_count_2,
           count(*) filter (where rating=3)::integer as rating_count_3,
           count(*) filter (where rating=4)::integer as rating_count_4,
           count(*) filter (where rating=5)::integer as rating_count_5
         from pbn_product_review
         where product_id=$1 and status='approved' and deleted_at is null
       ) summary
       where stats.product_id=$1`,
      [productId]
    )
    await client.query("commit")
  } catch (error) {
    await client.query("rollback")
    throw error
  } finally {
    await client.end()
  }
})

test("评论区在桌面、平板和移动端无横向溢出且主要功能可见", async ({ page, context }) => {
  fs.mkdirSync("/tmp/pbn-playwright", { recursive: true })
  await context.addCookies([
    {
      name: "_medusa_jwt",
      value: customerToken,
      url: storefrontUrl,
      httpOnly: true,
      sameSite: "Lax",
    },
  ])
  const viewports = [
    { name: "desktop", width: 1440, height: 1000 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "mobile", width: 390, height: 844 },
  ]

  await page.setViewportSize({ width: viewports[0].width, height: viewports[0].height })
  await page.goto(`${storefrontUrl}/us/products/${productHandle}#reviews`, {
    waitUntil: "domcontentloaded",
    timeout: 180_000,
  })

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    const reviews = page.locator("#reviews")
    await expect(reviews).toBeVisible()
    await expect(reviews.getByRole("heading", { name: "Product reviews" })).toBeVisible()
    await expect(reviews.getByText("Playwright responsive review")).toBeVisible()
    await expect(reviews.getByText("PetBoxNest reply")).toBeVisible()
    await expect(reviews.getByText("Write a review")).toBeVisible()
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    )
    expect(overflow).toBe(false)
    const searchHeight = await reviews
      .getByLabel("Search reviews")
      .evaluate((element) => element.getBoundingClientRect().height)
    expect(searchHeight).toBeGreaterThanOrEqual(44)
    await reviews.screenshot({
      path: `/tmp/pbn-playwright/product-reviews-${viewport.name}.png`,
    })
  }
})

test("Admin 评论页显示统计、产品选择、多选筛选和操作列", async ({ page }) => {
  await page.route("http://203.88.118.104:7020/**", async (route) => {
    const response = await route.fetch({
      url: route.request().url().replace("http://203.88.118.104:7020", backendUrl),
    })
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        "access-control-allow-origin": backendUrl,
        "access-control-allow-credentials": "true",
      },
    })
  })
  const session = await page.request.post(`${backendUrl}/auth/session`, {
    headers: { authorization: `Bearer ${adminToken}` },
  })
  expect(session.ok()).toBe(true)
  const sessionCookie = session.headers()["set-cookie"]?.match(/petboxnest\.sid=([^;]+)/)?.[1]
  expect(sessionCookie).toBeTruthy()
  await page.context().addCookies([
    {
      name: "petboxnest.sid",
      value: sessionCookie!,
      url: backendUrl,
      httpOnly: true,
      sameSite: "Lax",
    },
  ])
  await page.setExtraHTTPHeaders({ authorization: `Bearer ${adminToken}` })
  await page.goto(`${backendUrl}/app/product-reviews`, {
    waitUntil: "domcontentloaded",
    timeout: 180_000,
  })
  await expect(page.getByRole("heading", { name: "产品评论" })).toBeVisible()
  await expect(page.getByRole("button", { name: "选择产品" })).toBeVisible()
  await expect(page.getByRole("button", { name: "状态" })).toBeVisible()
  await expect(page.getByRole("button", { name: "星级" })).toBeVisible()
  await expect(page.getByRole("columnheader", { name: "操作" })).toBeVisible()
  await page.screenshot({
    path: "/tmp/pbn-playwright/admin-product-reviews.png",
    fullPage: true,
  })
})
