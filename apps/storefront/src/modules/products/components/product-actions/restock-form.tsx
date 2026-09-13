"use client"

import { subscribeToRestock } from "@lib/data/commerce-automation"
import { useState } from "react"

export default function RestockForm({ variantId, countryCode }: { variantId: string; countryCode: string }) {
  const [email, setEmail] = useState("")
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!consent) return
    setStatus("loading")
    try {
      await subscribeToRestock({ variant_id: variantId, email, country_code: countryCode, consent })
      setStatus("success")
      setMessage("You’re on the list. We’ll email you when this option is available again.")
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "We couldn’t save your alert. Please try again.")
    }
  }

  if (status === "success") {
    return <div className="rounded-[18px] border border-brand/20 bg-mint/50 p-4 text-sm font-semibold text-ink" role="status">{message}</div>
  }

  return <form onSubmit={submit} className="rounded-[20px] border border-[#E4E1F2] bg-[#F8F7FC] p-4" aria-label="Back in stock notification">
    <p className="font-display text-lg font-bold text-ink">Want a heads-up?</p>
    <p className="mt-1 text-sm leading-5 text-muted">Leave your email and we’ll send one alert when this option returns.</p>
    <div className="mt-4 flex flex-col gap-3 small:flex-row">
      <label className="sr-only" htmlFor="restock-email">Email address</label>
      <input id="restock-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" className="pbn-focus min-h-12 flex-1 rounded-[14px] border border-[#D9D6E8] bg-white px-4 text-sm text-ink" />
      <button type="submit" disabled={!consent || status === "loading"} className="pbn-focus min-h-12 rounded-[14px] bg-ink px-5 text-sm font-bold text-white transition hover:bg-brand disabled:cursor-not-allowed disabled:opacity-50">{status === "loading" ? "Saving…" : "Notify me"}</button>
    </div>
    <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs leading-5 text-muted">
      <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 h-4 w-4 accent-brand" required />
      <span>I agree to receive this one-time availability email. I can unsubscribe at any time.</span>
    </label>
    {status === "error" && <p className="mt-3 text-sm font-semibold text-red-600" role="alert">{message}</p>}
  </form>
}
