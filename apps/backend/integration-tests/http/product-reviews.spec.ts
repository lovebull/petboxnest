import fs from "node:fs"
import path from "node:path"
import { Client } from "pg"

const baseUrl = process.env.PRODUCT_REVIEW_TEST_BASE_URL || "http://127.0.0.1:7020"
const customerEmail = process.env.PRODUCT_REVIEW_TEST_CUSTOMER || "admin@example.com"
const customerPassword = process.env.PRODUCT_REVIEW_TEST_PASSWORD || "123456"
const storefrontEnv = fs.readFileSync(
  path.resolve(process.cwd(), "../storefront/.env.local"),
  "utf8"
)
const publishableKey = storefrontEnv.match(
  /^NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=(.+)$/m
)?.[1]

type JsonResponse = { status: number; body: Record<string, any> }
const request = async (
  pathname: string,
  init?: RequestInit
): Promise<JsonResponse> => {
  const response = await fetch(`${baseUrl}${pathname}`, init)
  return {
    status: response.status,
    body: (await response.json().catch(() => ({}))) as Record<string, any>,
  }
}

describe("PetBoxNest product-review HTTP API", () => {
  jest.setTimeout(60_000)
  let reviewId = ""
  let productId = ""

  afterAll(async () => {
    if (!reviewId || !process.env.DATABASE_URL) return
    const client = new Client({ connectionString: process.env.DATABASE_URL })
    await client.connect()
    try {
      await client.query("begin")
      await client.query(
        "delete from pbn_product_review_audit where review_id = $1",
        [reviewId]
      )
      await client.query(
        "delete from pbn_product_review_reply where review_id = $1",
        [reviewId]
      )
      await client.query("delete from pbn_product_review where id = $1", [reviewId])
      await client.query(
        `update pbn_product_review_stats stats set
          review_count = totals.review_count,
          average_rating = totals.average_rating,
          rating_count_1 = totals.rating_count_1,
          rating_count_2 = totals.rating_count_2,
          rating_count_3 = totals.rating_count_3,
          rating_count_4 = totals.rating_count_4,
          rating_count_5 = totals.rating_count_5,
          updated_at = now()
         from (
           select
             count(*)::integer review_count,
             coalesce(round(avg(rating), 2), 0)::double precision average_rating,
             count(*) filter (where rating = 1)::integer rating_count_1,
             count(*) filter (where rating = 2)::integer rating_count_2,
             count(*) filter (where rating = 3)::integer rating_count_3,
             count(*) filter (where rating = 4)::integer rating_count_4,
             count(*) filter (where rating = 5)::integer rating_count_5
           from pbn_product_review
           where product_id = $1 and status = 'approved' and deleted_at is null
         ) totals
         where stats.product_id = $1`,
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

  it("enforces auth and completes submission, moderation, reply, search, batch and audit flows", async () => {
    expect(publishableKey).toBeTruthy()
    const publishableHeaders = {
      "x-publishable-api-key": publishableKey!,
    }
    const unauthorized = await request(
      "/store/customers/me/product-reviews",
      {
        method: "POST",
        headers: { ...publishableHeaders, "content-type": "application/json" },
        body: JSON.stringify({
          product_id: "prod_missing",
          rating: 5,
          content: "This request must not be accepted.",
        }),
      }
    )
    expect(unauthorized.status).toBe(401)

    const customerAuth = await request("/auth/customer/emailpass", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: customerEmail, password: customerPassword }),
    })
    const adminAuth = await request("/auth/user/emailpass", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: customerEmail, password: customerPassword }),
    })
    expect(customerAuth.status).toBe(200)
    expect(adminAuth.status).toBe(200)

    const storeHeaders = {
      ...publishableHeaders,
      authorization: `Bearer ${customerAuth.body.token}`,
      "content-type": "application/json",
    }
    const adminHeaders = {
      authorization: `Bearer ${adminAuth.body.token}`,
      "content-type": "application/json",
    }
    const products = await request("/store/products?limit=10&fields=id", {
      headers: publishableHeaders,
    })
    expect(products.status).toBe(200)

    const marker = `automated-review-${Date.now()}`
    for (const product of products.body.products) {
      const create = await request("/store/customers/me/product-reviews", {
        method: "POST",
        headers: storeHeaders,
        body: JSON.stringify({
          product_id: product.id,
          rating: 4,
          title: marker,
          content: "Temporary automated integration review for PetBoxNest.",
        }),
      })
      if (create.status === 201) {
        reviewId = create.body.review.id
        productId = product.id
        expect(create.body.review.status).toBe("pending")
        expect(create.body.review).not.toHaveProperty("customer_id")
        expect(create.body.review).not.toHaveProperty("flag_reason")
        break
      }
      expect(create.status).toBe(409)
    }
    expect(reviewId).toBeTruthy()

    const duplicate = await request("/store/customers/me/product-reviews", {
      method: "POST",
      headers: storeHeaders,
      body: JSON.stringify({
        product_id: productId,
        rating: 4,
        title: marker,
        content: "Temporary automated integration review for PetBoxNest.",
      }),
    })
    expect(duplicate.status).toBe(409)

    const invalidRating = await request(
      "/store/customers/me/product-reviews",
      {
        method: "POST",
        headers: storeHeaders,
        body: JSON.stringify({
          product_id: productId,
          rating: 6,
          content: "Invalid rating must be rejected.",
        }),
      }
    )
    expect(invalidRating.status).toBe(400)

    const pendingPublic = await request(
      `/store/products/${productId}/reviews?q=${marker}`,
      { headers: publishableHeaders }
    )
    expect(pendingPublic.body.reviews).toHaveLength(0)

    expect(
      (
        await request(`/admin/product-reviews/${reviewId}/status`, {
          method: "POST",
          headers: adminHeaders,
          body: JSON.stringify({ status: "approved" }),
        })
      ).status
    ).toBe(200)
    expect(
      (
        await request(`/admin/product-reviews/${reviewId}/reply`, {
          method: "POST",
          headers: adminHeaders,
          body: JSON.stringify({ content: "Automated merchant reply nebula-cactus." }),
        })
      ).status
    ).toBe(200)

    const publicSearch = await request(
      `/store/products/${productId}/reviews?q=nebula%20cactus&rating=4`,
      { headers: publishableHeaders }
    )
    expect(publicSearch.status).toBe(200)
    expect(publicSearch.body.reviews[0].id).toBe(reviewId)
    expect(publicSearch.body.reviews[0].reply).toBeTruthy()
    expect(publicSearch.body.average_rating).toBe(4)
    expect(publicSearch.body.rating_distribution[4]).toBeGreaterThanOrEqual(1)

    const combined = await request(
      `/admin/product-reviews?product_id=${productId}&statuses=approved,pending&ratings=4,5&has_reply=true&q=nebula&date_from=2020-01-01T00:00:00.000Z&date_to=2030-01-01T00:00:00.000Z`,
      { headers: adminHeaders }
    )
    expect(combined.status).toBe(200)
    expect(combined.body.reviews.some((review: any) => review.id === reviewId)).toBe(true)

    const batch = await request("/admin/product-reviews/batch-status", {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({ ids: [reviewId], status: "flagged", reason: "Automated test" }),
    })
    expect(batch.status).toBe(200)
    expect(batch.body.success_count).toBe(1)
    expect(batch.body.failure_count).toBe(0)
    expect(batch.body.batch_id).toBeTruthy()

    const hidden = await request(
      `/store/products/${productId}/reviews?q=${marker}`,
      { headers: publishableHeaders }
    )
    expect(hidden.body.reviews).toHaveLength(0)
    const detail = await request(`/admin/product-reviews/${reviewId}`, {
      headers: adminHeaders,
    })
    expect(detail.body.review.audits.length).toBeGreaterThanOrEqual(3)
  })
})
