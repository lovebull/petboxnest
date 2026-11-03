import { Heading } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Help = () => {
  return (
    <section className="rounded-[24px] bg-mist p-5 small:rounded-[28px] small:p-7">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">We are here</p>
      <Heading className="mt-2 font-display text-2xl font-bold text-ink">Need a hand with your order?</Heading>
      <p className="mt-2 text-sm leading-6 text-muted">Our support team can help with delivery questions, returns, or anything that feels unclear.</p>
      <div className="my-4 text-sm font-semibold">
        <ul className="flex flex-wrap gap-x-5 gap-y-3">
          <li>
            <LocalizedClientLink className="text-brand hover:text-brand-dark" href="/contact">Contact us</LocalizedClientLink>
          </li>
          <li>
            <LocalizedClientLink className="text-brand hover:text-brand-dark" href="/refund-policy">
              Returns &amp; Refunds Policy
            </LocalizedClientLink>
          </li>
        </ul>
      </div>
    </section>
  )
}

export default Help
