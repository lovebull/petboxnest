"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { subscribeToNewsletter, type NewsletterState } from "@lib/data/newsletter"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const initialState: NewsletterState = { status: "idle", message: "" }

const EarlyAccessSignup = () => {
  const [state, action, pending] = useActionState(subscribeToNewsletter, initialState)
  const [returnMessage, setReturnMessage] = useState("")
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    const result = new URLSearchParams(window.location.search).get("newsletter")
    if (result === "confirmed") setReturnMessage("Your subscription is confirmed. Welcome to the nest!")
    if (result === "unsubscribed") setReturnMessage("You have been unsubscribed successfully.")
    if (result === "invalid") setReturnMessage("This confirmation link is invalid or has expired.")
  }, [])

  useEffect(() => {
    if (state.status === "success" || state.status === "already_subscribed") formRef.current?.reset()
  }, [state.status])

  const message = state.message || returnMessage
  const isError = state.status === "error" || returnMessage.includes("invalid")

  return (
    <section id="early-access" className="bg-mint py-16 small:py-20">
      <div className="pbn-container">
        <div className="mx-auto max-w-[680px] text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Stay in the loop</p>
          <h2 className="mt-3 font-display text-[34px] font-bold leading-tight tracking-[-0.035em] text-ink small:text-[46px]">Fresh finds for their favorite corner.</h2>
          <p className="mt-4 text-base leading-7 text-muted">Get first looks at useful new arrivals and thoughtful ideas for living better with pets.</p>
          <form ref={formRef} action={action} className="mx-auto mt-8 max-w-[520px] text-left">
            <div className="relative">
              <label htmlFor="early-access-email" className="sr-only">Email address</label>
              <input id="early-access-email" name="email" type="email" required autoComplete="email" placeholder="Email address" disabled={pending} className="h-12 w-full rounded-[14px] border-2 border-ink bg-white px-4 pr-14 text-base text-ink outline-none transition-colors placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-70" />
              <button type="submit" disabled={pending} aria-label={pending ? "Joining the email list" : "Join the email list"} className="pbn-focus absolute inset-y-1 right-1 flex w-11 items-center justify-center rounded-[11px] bg-brand text-xl text-white transition-colors hover:bg-brand-dark disabled:cursor-wait disabled:opacity-70"><span aria-hidden="true">{pending ? "…" : "→"}</span></button>
            </div>
            <label className="mt-3 flex cursor-pointer items-start gap-2 text-sm leading-5 text-ink-soft">
              <input name="consent" type="checkbox" required className="mt-1 size-4 rounded border-ink accent-brand" />
              <span>I agree to receive PetBoxNest emails. I can unsubscribe anytime. See our <LocalizedClientLink href="/privacy-policy" className="font-bold text-brand underline underline-offset-2">Privacy Policy</LocalizedClientLink>.</span>
            </label>
            <div aria-live="polite" className="min-h-7 pt-3 text-center text-sm font-semibold">
              {message && <p className={isError ? "text-red-700" : "text-ink"}>{message}</p>}
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default EarlyAccessSignup
