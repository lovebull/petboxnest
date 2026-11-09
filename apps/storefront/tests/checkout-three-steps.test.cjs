const { test } = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const ts = require("typescript")
const React = require("react")
const { renderToStaticMarkup } = require("react-dom/server")

function load(relative, imports) {
  const source = fs.readFileSync(
    path.resolve(__dirname, "../src", relative),
    "utf8"
  )
  const code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText
  const m = { exports: {} }
  new Function("require", "module", "exports", "process", code)(
    (name) => {
      if (name in imports) {
        const value = imports[name]
        return Object.hasOwn(value, "default")
          ? { ...value, __esModule: true }
          : value
      }
      if (name === "react" || name === "react/jsx-runtime") return require(name)
      throw Error(`Unmocked dependency: ${name}`)
    },
    m,
    m.exports,
    {
      env: {
        NEXT_PUBLIC_MEDUSA_BACKEND_URL: "https://example.test",
        NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: "test",
      },
    }
  )
  return m.exports
}

const prefix = "modules/checkout/components/"
const div = ({ children }) => React.createElement("div", null, children)
const icons = new Proxy({}, { get: () => () => React.createElement("svg") })
const constants = {
  isStripeLike: (id) => id?.startsWith("pp_stripe_"),
  isManual: (id) => id?.startsWith("pp_system_"),
  paymentInfoMap: {},
}
const loyalty = load("lib/types/loyalty.ts", {})
function setup(step = "payment") {
  const imports = {
    "@lib/constants": constants,
    "@lib/types/loyalty": loyalty,
    "@lib/data/cart": {
      initiatePaymentSession: () => {
        throw Error("No live session calls in render tests")
      },
      placeOrder: () => {
        throw Error("No real orders in tests")
      },
    },
    "@medusajs/icons": icons,
    "@modules/common/components/ui": load("modules/common/components/ui/index.tsx", {
      clsx: require("clsx"),
    }),
    "next/navigation": {
      useSearchParams: () => new URLSearchParams({ step }),
      usePathname: () => "/us/checkout",
      useRouter: () => ({}),
      useParams: () => ({ countryCode: "us" }),
    },
    "@stripe/react-stripe-js": {
      useStripe: () => ({}),
      useElements: () => ({}),
    },
    "../error-message": { default: () => null },
    "@modules/checkout/components/error-message": { default: () => null },
    "@headlessui/react": { RadioGroup: div },
    "@modules/checkout/components/payment-container": {
      default: () => null,
      StripePaymentContainer: () => null,
    },
    "@modules/common/components/localized-client-link": {
      default: ({ href, children }) =>
        React.createElement("a", { href: "/us" + href }, children),
    },
    "@easypayment/medusa-paypal-ui": {
      PAYPAL_WALLET_PROVIDER_ID: "pp_paypal_paypal",
      PAYPAL_CARD_PROVIDER_ID: "pp_paypal_card_paypal_card",
      isPayPalProviderId: (id) => id?.startsWith("pp_paypal"),
      usePayPalPaymentMethods: () => ({
        paypalEnabled: true,
        cardEnabled: true,
      }),
      PayPalPaymentSection: ({ sessionLoading }) =>
        React.createElement(
          "button",
          { "data-testid": "paypal", disabled: sessionLoading },
          "PayPal"
        ),
    },
  }
  imports["../checkout-terms"] = load(
    prefix + "checkout-terms/index.tsx",
    imports
  )
  imports["../payment-button"] = load(
    prefix + "payment-button/index.tsx",
    imports
  )
  return {
    payment: load(prefix + "payment/index.tsx", imports).default,
    progress: load(prefix + "checkout-progress/index.tsx", imports).default,
    button: imports["../payment-button"].default,
  }
}
const base = {
  id: "test",
  total: 10,
  email: "test@example.test",
  shipping_address: { address_1: "Test" },
  billing_address: { address_1: "Test" },
  shipping_methods: [{ id: "test" }],
}
const cart = (provider) => ({
  ...base,
  payment_collection: {
    payment_sessions: [{ provider_id: provider, status: "pending" }],
  },
})
const html = (component, props) =>
  renderToStaticMarkup(React.createElement(component, props))
function payment(provider, overrides = {}, step = "payment") {
  return html(setup(step).payment, {
    cart: { ...cart(provider), ...overrides },
    availablePaymentMethods: [{ id: provider }],
  })
}

test("payment and legacy review URLs show three progress steps with Payment current", () => {
  for (const step of ["payment", "review"]) {
    const result = html(setup(step).progress)
    assert.equal((result.match(/<li /g) || []).length, 3)
    assert.match(result, /aria-current="step"[\s\S]*Payment/)
    assert.doesNotMatch(result, />Review</)
    assert.match(payment("pp_system_default", {}, step), /class="block"/)
  }
})
test("manual payment has final order button and localized policies in step three", () => {
  const result = payment("pp_system_default")
  assert.match(result, /data-testid="submit-order-button">Place order/)
  for (const policy of ["terms-of-service", "refund-policy", "privacy-policy"])
    assert.match(result, new RegExp(`/us/${policy}`))
  assert.doesNotMatch(result, /Continue to review|checkout-review-heading/)
})
test("missing prerequisites disable final order submission", () => {
  for (const overrides of [
    { email: "" },
    { shipping_address: null },
    { billing_address: null },
    { shipping_methods: [] },
  ]) {
    assert.match(
      payment("pp_system_default", overrides),
      /<button disabled=""[^>]*data-testid="submit-order-button"/
    )
    assert.doesNotMatch(
      payment("pp_paypal_paypal", overrides),
      /data-testid="paypal"/
    )
  }
})
test("PayPal retains its own payment control and gets terms before the control", () => {
  const result = payment("pp_paypal_paypal")
  assert.match(result, /Terms of Service[\s\S]*data-testid="paypal"/)
  assert.doesNotMatch(result, /data-testid="submit-order-button"/)
})
test("zero balance paid by credit bypasses external payment even with old PayPal selection", () => {
  for (const reference of ["gift-card", "store-credit"]) {
    const result = payment("pp_paypal_paypal", {
      total: 0,
      credit_lines: [{ reference, amount: 10 }],
    })
    assert.match(result, /data-testid="submit-order-button">Place order/)
    assert.doesNotMatch(result, /data-testid="paypal"/)
  }
})
test("Stripe cannot submit until card fields are complete", () => {
  assert.match(
    payment("pp_stripe_stripe"),
    /<button disabled=""[^>]*data-testid="submit-order-button"/
  )
})
test("payment button uses pending session instead of a cancelled first session", () => {
  const data = cart("pp_system_default")
  data.payment_collection.payment_sessions.unshift({
    provider_id: "obsolete",
    status: "canceled",
  })
  assert.match(
    html(setup().button, { cart: data, "data-testid": "submit-order-button" }),
    />Place order</
  )
})
