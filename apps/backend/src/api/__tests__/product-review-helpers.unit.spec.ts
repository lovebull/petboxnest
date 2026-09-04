import { listReviews, pagination } from "../product-review-helpers"

describe("product review query helpers", () => {
  it("calculates page metadata", () => {
    expect(pagination(21, 2, 10)).toEqual({
      count: 21,
      page: 2,
      page_size: 10,
      page_count: 3,
    })
    expect(pagination(0, 1, 10).page_count).toBe(1)
  })

  it("forces caller filters and applies server pagination", async () => {
    const service = {
      listAndCountProductReviews: jest.fn().mockResolvedValue([[], 27]),
      listProductReviewReplies: jest.fn().mockResolvedValue([]),
    }

    const result = await listReviews(
      service as never,
      { page: 2, limit: 10, rating: 5, sort: "newest" },
      { product_id: "prod_test", status: "approved" }
    )

    expect(service.listAndCountProductReviews).toHaveBeenCalledWith(
      { product_id: "prod_test", status: "approved", rating: 5 },
      { take: 10, skip: 10, order: { created_at: "DESC" } }
    )
    expect(result.count).toBe(27)
  })

  it("uses the module's PostgreSQL full-text search before pagination", async () => {
    const service = {
      searchProductReviewIds: jest.fn().mockResolvedValue(["review_1"]),
      listProductReviewReplies: jest.fn().mockResolvedValue([]),
      listAndCountProductReviews: jest.fn().mockResolvedValue([[], 0]),
    }

    await listReviews(service as never, {
      page: 1,
      limit: 20,
      q: "helpful",
      sort: "highest",
    })

    expect(service.searchProductReviewIds).toHaveBeenCalledWith("helpful")
    expect(service.listAndCountProductReviews).toHaveBeenCalledWith(
      expect.objectContaining({ id: ["review_1"] }),
      expect.objectContaining({ order: { rating: "DESC", created_at: "DESC" } })
    )
  })
})
