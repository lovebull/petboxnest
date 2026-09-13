import { expect, test } from "@playwright/test"

const backendUrl = process.env.PLAYWRIGHT_BACKEND_URL || "http://127.0.0.1:7020"
const email = process.env.ADMIN_E2E_EMAIL
const password = process.env.ADMIN_E2E_PASSWORD

test("缺货通知与弃购恢复管理页面可访问并展示双语层级", async ({ page }) => {
  test.setTimeout(300_000)
  test.skip(!email || !password, "ADMIN_E2E_EMAIL and ADMIN_E2E_PASSWORD are required")
  const auth = await page.request.post(`${backendUrl}/auth/user/emailpass`, { data: { email, password } })
  expect(auth.ok()).toBe(true)
  const { token } = await auth.json()
  const session = await page.request.post(`${backendUrl}/auth/session`, { headers: { authorization: `Bearer ${token}` } })
  expect(session.ok()).toBe(true)
  const sessionCookie = session.headers()["set-cookie"]?.match(/petboxnest\.sid=([^;]+)/)?.[1]
  expect(sessionCookie).toBeTruthy()
  await page.context().addCookies([{ name: "petboxnest.sid", value: sessionCookie!, url: backendUrl, httpOnly: true, sameSite: "Lax" }])
  await page.setExtraHTTPHeaders({ authorization: `Bearer ${token}` })

  for (const route of [
    { path: "restock-notifications", heading: "缺货通知", description: "Restock notifications" },
    { path: "cart-recoveries", heading: "弃购恢复", description: "Abandoned cart recovery" },
  ]) {
    await page.goto(`${backendUrl}/app/${route.path}`, { waitUntil: "domcontentloaded" })
    await expect(page.getByRole("heading", { name: route.heading, exact: true })).toBeVisible()
    await expect(page.getByText(new RegExp(route.description))).toBeVisible()
    await expect(page.getByText(/暂无记录|No records/)).toBeVisible()
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${backendUrl}/app/cart-recoveries`, { waitUntil: "domcontentloaded" })
  await expect(page.getByRole("heading", { name: "弃购恢复", exact: true })).toBeVisible()
  await page.screenshot({ path: "/tmp/pbn-playwright/cart-recovery-admin-mobile.png" })
})
