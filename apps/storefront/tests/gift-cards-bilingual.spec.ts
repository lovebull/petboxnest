import { expect, test } from "@playwright/test"

const backendUrl = process.env.PLAYWRIGHT_BACKEND_URL || "http://127.0.0.1:7020"
const publicBackendUrl = "http://203.88.118.104:7020"
const email = process.env.ADMIN_E2E_EMAIL || "admin@example.com"
const password = process.env.ADMIN_E2E_PASSWORD || "123456"

test("礼品卡页面以中文在上、英文在下显示", async ({ page }) => {
  const auth = await page.request.post(`${backendUrl}/auth/user/emailpass`, {
    data: { email, password },
  })
  expect(auth.ok()).toBe(true)
  const { token } = await auth.json()

  const session = await page.request.post(`${backendUrl}/auth/session`, {
    headers: { authorization: `Bearer ${token}` },
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
  await page.setExtraHTTPHeaders({ authorization: `Bearer ${token}` })
  await page.route(`${publicBackendUrl}/**`, async (route) => {
    const response = await route.fetch({
      url: route.request().url().replace(publicBackendUrl, backendUrl),
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

  await page.goto(`${backendUrl}/app/gift-cards`, {
    waitUntil: "domcontentloaded",
    timeout: 180_000,
  })

  const chinese = page.getByText("礼品卡", { exact: true }).first()
  const english = page.getByText("Gift Cards", { exact: true }).first()
  await expect(chinese).toBeVisible()
  await expect(english).toBeVisible()

  const chineseBox = await chinese.boundingBox()
  const englishBox = await english.boundingBox()
  expect(chineseBox).not.toBeNull()
  expect(englishBox).not.toBeNull()
  expect(chineseBox!.y).toBeLessThan(englishBox!.y)

  const main = page.getByRole("main")
  const productsChinese = main.getByText("礼品卡商品", { exact: true })
  const productsEnglish = main.getByText("Gift Card Products", { exact: true })
  await expect(productsChinese).toBeVisible()
  await expect(productsEnglish).toBeVisible()

  const productsChineseBox = await productsChinese.boundingBox()
  const productsEnglishBox = await productsEnglish.boundingBox()
  expect(productsChineseBox).not.toBeNull()
  expect(productsEnglishBox).not.toBeNull()
  expect(productsChineseBox!.y).toBeLessThan(productsEnglishBox!.y)

  await page.screenshot({
    path: "/tmp/pbn-playwright/gift-cards-bilingual.png",
    fullPage: true,
  })
})
