import LocalizedClientLink from "@modules/common/components/localized-client-link"

const CheckoutTerms = () => (
  <div className="my-6 rounded-[16px] bg-cream p-4 xsmall:p-5">
    <p className="text-sm font-medium leading-6 text-muted">
      By placing your order or confirming your payment, you confirm that you
      have read and accept our{" "}
      <LocalizedClientLink
        href="/terms-of-service"
        className="pbn-focus font-bold text-brand underline underline-offset-4"
      >
        Terms of Service
      </LocalizedClientLink>
      ,{" "}
      <LocalizedClientLink
        href="/refund-policy"
        className="pbn-focus font-bold text-brand underline underline-offset-4"
      >
        Returns &amp; Refunds Policy
      </LocalizedClientLink>
      , and{" "}
      <LocalizedClientLink
        href="/privacy-policy"
        className="pbn-focus font-bold text-brand underline underline-offset-4"
      >
        Privacy Policy
      </LocalizedClientLink>
      .
    </p>
  </div>
)

export default CheckoutTerms
