import { expect, test } from "@playwright/test"

const backendUrl = process.env.PLAYWRIGHT_BACKEND_URL || "http://127.0.0.1:7020"
const publicBackendUrl = "http://203.88.118.104:7020"
const email = process.env.ADMIN_E2E_EMAIL || "admin@example.com"
const password = process.env.ADMIN_E2E_PASSWORD || "123456"

test("商店信用账户页面以中文在上、英文在下显示", async ({ page }) => {
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

  await page.goto(`${backendUrl}/app/store-credit-accounts`, {
    waitUntil: "domcontentloaded",
    timeout: 180_000,
  })

  const main = page.getByRole("main")
  const chinese = main.getByText("商店信用账户", { exact: true }).first()
  const english = main.getByText("Store Credit Accounts", { exact: true }).first()
  await expect(chinese).toBeVisible()
  await expect(english).toBeVisible()

  const chineseBox = await chinese.boundingBox()
  const englishBox = await english.boundingBox()
  expect(chineseBox).not.toBeNull()
  expect(englishBox).not.toBeNull()
  expect(chineseBox!.y).toBeLessThan(englishBox!.y)

  const emptyChinese = main.getByText("暂无商店信用账户", { exact: true })
  const emptyEnglish = main.getByText("No store credit accounts found", { exact: true })
  await expect(emptyChinese).toBeVisible()
  await expect(emptyEnglish).toBeVisible()

  const emptyChineseBox = await emptyChinese.boundingBox()
  const emptyEnglishBox = await emptyEnglish.boundingBox()
  expect(emptyChineseBox).not.toBeNull()
  expect(emptyEnglishBox).not.toBeNull()
  expect(emptyChineseBox!.y).toBeLessThan(emptyEnglishBox!.y)

  await page.screenshot({
    path: "/tmp/pbn-playwright/store-credit-accounts-bilingual.png",
    fullPage: true,
  })
})
