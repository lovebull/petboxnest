import { expect, test } from "@playwright/test"

const slugs = [
  "cat-hairball-or-cough-action-plan",
  "cat-hairball-prevention-guide",
  "keep-cat-litter-box-area-clean",
  "multi-cat-litter-box-guide",
]

for (const slug of slugs) {
  test(`article byline, dates, links and responsive layout: ${slug}`, async ({
    page,
  }) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    const response = await page.goto(
      `http://127.0.0.1:7000/us/articles/${slug}`
    )
    expect(response?.status()).toBe(200)
    const article = page.locator("article")
    await expect(article.locator("h1")).toBeVisible()
    await expect(article.locator("header")).toContainText(
      "PetBoxNest Editorial Team"
    )
    await expect(article.locator("header")).toContainText("First published:")
    await expect(article.locator("header")).toContainText("Last updated:")
    await expect(
      article.getByRole("complementary", { name: "About this content" })
    ).toBeVisible()
    expect(
      await article.locator('a[href^="/us/articles/"]').count()
    ).toBeGreaterThan(0)
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 900 })
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        )
      ).toBe(true)
    }
    expect(errors).toEqual([])
  })
}

test("missing articles return HTTP 404 before the shop shell streams", async ({
  request,
}) => {
  const response = await request.get(
    "http://127.0.0.1:7000/us/articles/pbn-missing-regression-check"
  )
  expect(response.status()).toBe(404)
})
