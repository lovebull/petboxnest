import { getSafeHttpUrl } from "../../modules/resend/safe-http-url"

describe("Email HTTP link validation", () => {
  it.each([
    "https://www.ups.com/track?tracknum=1Z123&loc=en_US",
    "https://www.fedex.com/fedextrack/?trknbr=123456789",
    "https://www.dhl.com/us-en/home/tracking.html?tracking-id=123456789",
    "http://carrier.example/track/123#details",
    "https://carrier.example/track?reference=Order%20123",
  ])("preserves valid carrier URLs: %s", (url) => {
    expect(getSafeHttpUrl(url)).toBe(url)
  })

  it("trims surrounding spaces and normalizes the URL", () => {
    expect(getSafeHttpUrl("  HTTPS://CARRIER.EXAMPLE/track?id=123  ")).toBe("https://carrier.example/track?id=123")
  })

  it.each([
    undefined, null, 123, {}, "", "   ", "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>", "mailto:test@example.com",
    "ftp://carrier.example/file", "//carrier.example/track", "/track/123",
    "carrier.example/track", "https:carrier.example", "https:///carrier.example",
    "https://", "https://[invalid", "https://carrier.example:99999/track",
    "https://user:secret@carrier.example/track", "https://user@carrier.example",
    "https://carrier.example/a b", "https://carrier.example/track\n?x=1",
    "https://carrier.example/track\t?x=1", "https://carrier.example/\u0000",
    "https://carrier.example\\@evil.example/track", "https://carrier.example/%ZZ",
  ])("rejects unsafe or malformed input: %p", (value) => {
    expect(getSafeHttpUrl(value)).toBeNull()
  })
})
