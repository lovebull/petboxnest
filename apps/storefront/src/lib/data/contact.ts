"use server"

import { headers } from "next/headers"

import { getPayloadServerUrl } from "@lib/util/public-url"

export type ContactFormState = {
  status: "idle" | "success" | "error"
  message: string
  reference?: string
}

const topics = new Set([
  "order_support",
  "shipping_or_return",
  "product_question",
  "warranty_claim",
  "other",
])

const value = (formData: FormData, key: string, maxLength: number) =>
  String(formData.get(key) || "").trim().slice(0, maxLength)

export async function submitContactForm(
  _state: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = value(formData, "name", 120)
  const email = value(formData, "email", 320).toLowerCase()
  const topic = value(formData, "topic", 40)
  const orderNumber = value(formData, "orderNumber", 120)
  const message = value(formData, "message", 5000)
  const countryCode = value(formData, "countryCode", 8).toLowerCase()
  const website = value(formData, "website", 200)

  if (
    name.length < 2 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !topics.has(topic) ||
    message.length < 10
  ) {
    return {
      status: "error",
      message: "Please complete all required fields. Your message must be at least 10 characters.",
    }
  }

  try {
    const incoming = await headers()
    const forwardedFor =
      incoming.get("x-forwarded-for") ||
      incoming.get("x-real-ip") ||
      "unknown"
    const response = await fetch(
      `${getPayloadServerUrl()}/api/contact-submissions/submit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": forwardedFor,
          "user-agent": incoming.get("user-agent") || "unknown",
        },
        body: JSON.stringify({
          name,
          email,
          topic,
          orderNumber,
          message,
          countryCode,
          website,
        }),
        cache: "no-store",
      }
    )
    const result = (await response.json().catch(() => ({}))) as {
      message?: string
      reference?: string
    }

    if (!response.ok) {
      return {
        status: "error",
        message: result.message || "We couldn't send your message. Please try again.",
      }
    }

    return {
      status: "success",
      message: "Thanks — your message has been sent. We'll reply within one to two business days.",
      reference: result.reference,
    }
  } catch {
    return {
      status: "error",
      message: "We couldn't connect to customer care. Please try again shortly.",
    }
  }
}
