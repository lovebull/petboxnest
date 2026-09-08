"use client"

import { ArrowRight } from "@medusajs/icons"
import { useActionState, useEffect, useRef } from "react"

import {
  submitContactForm,
  type ContactFormState,
} from "@lib/data/contact"

const initialState: ContactFormState = { status: "idle", message: "" }
const inputClasses =
  "pbn-focus min-h-[52px] w-full rounded-[14px] border border-[#E6E8EC] bg-white px-4 text-base text-ink outline-none transition-colors placeholder:text-muted focus:border-brand disabled:cursor-wait disabled:bg-mist disabled:opacity-70"

export default function ContactForm({ countryCode }: { countryCode: string }) {
  const [state, action, pending] = useActionState(
    submitContactForm,
    initialState
  )
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset()
    }
  }, [state.status])

  return (
    <form ref={formRef} action={action} className="mt-8 grid gap-6">
      <input type="hidden" name="countryCode" value={countryCode} />
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-6 xsmall:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-ink">
          Name <span className="sr-only">required</span>
          <input
            className={inputClasses}
            name="name"
            autoComplete="name"
            minLength={2}
            maxLength={120}
            disabled={pending}
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink">
          Email <span className="sr-only">required</span>
          <input
            className={inputClasses}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={320}
            disabled={pending}
            required
          />
        </label>
      </div>

      <div className="grid gap-6 xsmall:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-ink">
          Topic
          <select
            className={inputClasses}
            name="topic"
            defaultValue="order_support"
            disabled={pending}
          >
            <option value="order_support">Order support</option>
            <option value="shipping_or_return">Shipping or return</option>
            <option value="product_question">Product question</option>
            <option value="warranty_claim">Warranty claim</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink">
          Order number
          <span className="font-normal text-muted">(optional)</span>
          <input
            className={inputClasses}
            name="orderNumber"
            maxLength={120}
            disabled={pending}
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-bold text-ink">
        Message <span className="sr-only">required</span>
        <textarea
          className={`${inputClasses} min-h-40 resize-y py-4`}
          name="message"
          minLength={10}
          maxLength={5000}
          disabled={pending}
          required
        />
      </label>

      <div>
        <button
          type="submit"
          disabled={pending}
          className="pbn-primary-button w-full gap-2 disabled:cursor-wait disabled:opacity-70 xsmall:w-auto"
        >
          {pending ? "Sending…" : "Send message"}
          {!pending && <ArrowRight aria-hidden="true" />}
        </button>
        <div
          className="min-h-7 pt-3 text-sm font-semibold"
          aria-live="polite"
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message && (
            <p className={state.status === "error" ? "text-red-700" : "text-[#2F7D58]"}>
              {state.message}
              {state.reference ? ` Reference: ${state.reference}.` : ""}
            </p>
          )}
        </div>
      </div>
    </form>
  )
}
