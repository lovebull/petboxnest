import { createRecoveryToken, hashAutomationToken, verifyRecoveryToken } from "../commerce-automation-token"

describe("commerce automation tokens", () => {
  const originalSecret = process.env.CART_RECOVERY_SECRET

  beforeAll(() => { process.env.CART_RECOVERY_SECRET = "unit-test-secret-at-least-32-characters" })
  afterAll(() => {
    if (originalSecret === undefined) delete process.env.CART_RECOVERY_SECRET
    else process.env.CART_RECOVERY_SECRET = originalSecret
  })

  it("verifies a valid signed token", () => {
    const expiresAt = new Date(Date.now() + 60_000)
    const token = createRecoveryToken("carrec_test", expiresAt)
    expect(verifyRecoveryToken(token).recovery_id).toBe("carrec_test")
    expect(hashAutomationToken(token)).toHaveLength(64)
  })

  it("rejects a tampered signature", () => {
    const token = createRecoveryToken("carrec_test", new Date(Date.now() + 60_000))
    expect(() => verifyRecoveryToken(`${token}x`)).toThrow("Invalid recovery token")
  })

  it("rejects an expired token", () => {
    const token = createRecoveryToken("carrec_test", new Date(Date.now() - 1_000))
    expect(() => verifyRecoveryToken(token)).toThrow("expired")
  })
})
