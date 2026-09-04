import { recalculateStats } from "../helpers"

describe("product-review statistics", () => {
  it("calculates approved average and star distribution", async () => {
    const service = {
      listAndCountProductReviews: jest.fn().mockResolvedValue([
        [{ rating: 5 }, { rating: 4 }, { rating: 4 }, { rating: 1 }],
        4,
      ]),
      listProductReviewStats: jest.fn().mockResolvedValue([]),
      createProductReviewStats: jest.fn().mockImplementation((value) => value),
    }

    const result = await recalculateStats(service as never, "prod_test")

    expect(service.listAndCountProductReviews).toHaveBeenCalledWith(
      { product_id: "prod_test", status: "approved" },
      { take: 10000 }
    )
    expect(result).toEqual(
      expect.objectContaining({
        product_id: "prod_test",
        average_rating: 3.5,
        review_count: 4,
        rating_count_1: 1,
        rating_count_2: 0,
        rating_count_3: 0,
        rating_count_4: 2,
        rating_count_5: 1,
      })
    )
  })

  it("updates an existing stats row back to zero", async () => {
    const service = {
      listAndCountProductReviews: jest.fn().mockResolvedValue([[], 0]),
      listProductReviewStats: jest.fn().mockResolvedValue([{ id: "stats_1" }]),
      updateProductReviewStats: jest.fn().mockImplementation((value) => value),
    }

    const result = await recalculateStats(service as never, "prod_test")

    expect(result).toEqual(
      expect.objectContaining({
        id: "stats_1",
        average_rating: 0,
        review_count: 0,
      })
    )
  })
})
