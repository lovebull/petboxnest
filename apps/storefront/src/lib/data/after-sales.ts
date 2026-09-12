"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

export type AfterSalesType =
  "cancel" | "return" | "damaged_claim" | "lost_claim"
export type AfterSalesInput = {
  type: AfterSalesType
  reason_code: string
  reason_text?: string | null
  customer_note?: string | null
  items: Array<{
    order_item_id: string
    quantity: number
    reason_code?: string
    exchange_variant_id?: string
  }>
  attachment_urls?: Array<{ url: string; mime_type: string; size: number }>
}

const errorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "We couldn't complete that request. Please try again."

export async function getOrderAfterSales(orderId: string) {
  try {
    return await sdk.client.fetch<any>(`/store/orders/${orderId}/after-sales`, {
      headers: await getAuthHeaders(),
      cache: "no-store",
    })
  } catch (error) {
    return { error: errorMessage(error) }
  }
}

export async function createOrderAfterSales(
  orderId: string,
  input: AfterSalesInput,
) {
  try {
    return await sdk.client.fetch<any>(`/store/orders/${orderId}/after-sales`, {
      method: "POST",
      body: input,
      headers: await getAuthHeaders(),
      cache: "no-store",
    })
  } catch (error) {
    return { error: errorMessage(error) }
  }
}

export async function cancelOrderAfterSales(requestId: string) {
  try {
    return await sdk.client.fetch<any>(
      `/store/after-sales/${requestId}/cancel`,
      {
        method: "POST",
        body: {},
        headers: await getAuthHeaders(),
        cache: "no-store",
      },
    )
  } catch (error) {
    return { error: errorMessage(error) }
  }
}

export async function downloadOrderInvoice(orderId: string) {
  try {
    return await sdk.client.fetch<{
      filename: string
      content_type: string
      base64: string
    }>(`/store/orders/${orderId}/invoice`, {
      query: { format: "json" },
      headers: await getAuthHeaders(),
      cache: "no-store",
    })
  } catch (error) {
    return { error: errorMessage(error) }
  }
}

export async function requestGuestAfterSalesCode(
  orderReference: string,
  email: string,
) {
  try {
    return await sdk.client.fetch<any>(
      "/store/after-sales/guest/request-code",
      {
        method: "POST",
        body: { order_reference: orderReference, email },
        cache: "no-store",
      },
    )
  } catch (error) {
    return { error: errorMessage(error) }
  }
}

export async function verifyGuestAfterSalesCode(
  orderReference: string,
  email: string,
  code: string,
) {
  try {
    return await sdk.client.fetch<any>("/store/after-sales/guest/verify", {
      method: "POST",
      body: { order_reference: orderReference, email, code },
      cache: "no-store",
    })
  } catch (error) {
    return { error: errorMessage(error) }
  }
}

export async function getGuestAfterSalesOrder(
  orderId: string,
  accessToken: string,
) {
  try {
    return await sdk.client.fetch<any>("/store/after-sales/guest/order", {
      method: "POST",
      body: { order_id: orderId, access_token: accessToken },
      cache: "no-store",
    })
  } catch (error) {
    return { error: errorMessage(error) }
  }
}

export async function createGuestAfterSales(
  input: AfterSalesInput & { order_id: string; guest_access_token: string },
) {
  try {
    return await sdk.client.fetch<any>("/store/after-sales/guest/requests", {
      method: "POST",
      body: input,
      cache: "no-store",
    })
  } catch (error) {
    return { error: errorMessage(error) }
  }
}

type UploadedEvidence = { url: string; mime_type: string; size: number }

export async function uploadAfterSalesEvidence(formData: FormData) {
  try {
    const orderId = String(formData.get("order_id") || "")
    const guestAccessToken = String(formData.get("guest_access_token") || "")
    const files = formData
      .getAll("files")
      .filter((value): value is File => value instanceof File && value.size > 0)

    if (!orderId || !files.length || files.length > 8) {
      return { error: "Choose between 1 and 8 evidence images." }
    }
    const descriptors = files.map((file) => ({
      name: file.name,
      mime_type: file.type,
      size: file.size,
    }))
    const response = guestAccessToken
      ? await sdk.client.fetch<any>("/store/after-sales/guest/uploads", {
          method: "POST",
          body: {
            order_id: orderId,
            guest_access_token: guestAccessToken,
            files: descriptors,
          },
          cache: "no-store",
        })
      : await sdk.client.fetch<any>(
          `/store/orders/${orderId}/after-sales/uploads`,
          {
            method: "POST",
            body: { files: descriptors },
            headers: await getAuthHeaders(),
            cache: "no-store",
          },
        )

    const attachments: UploadedEvidence[] = []
    for (let index = 0; index < files.length; index++) {
      const upload = response.uploads[index]
      const uploadResponse = await fetch(upload.upload_url, {
        method: "PUT",
        headers: { "content-type": files[index].type },
        body: await files[index].arrayBuffer(),
      })
      if (!uploadResponse.ok) {
        throw new Error(`Evidence image ${index + 1} could not be uploaded.`)
      }
      attachments.push({
        url: upload.file_url,
        mime_type: upload.mime_type,
        size: upload.size,
      })
    }
    return { attachments }
  } catch (error) {
    return { error: errorMessage(error) }
  }
}
