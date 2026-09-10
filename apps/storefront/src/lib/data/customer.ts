"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { FetchError } from "@medusajs/js-sdk"
import { revalidateTag } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { randomUUID } from "node:crypto"
import {
  getAuthHeaders,
  getCacheTag,
  getCartId,
  getPendingCustomer,
  removeAuthToken,
  removeCartId,
  removePendingCustomer,
  setAuthToken,
  setPendingCustomer,
} from "./cookies"

export type CustomerAuthState =
  | { state: "error"; error: string }
  | { state: "verification_required"; email: string }
  | { state: "success" }
  | null

export type PasswordResetState = {
  state: "idle" | "success" | "error"
  message: string
}

export async function requestPasswordReset(
  _currentState: PasswordResetState,
  formData: FormData
): Promise<PasswordResetState> {
  const email = String(formData.get("email") || "").trim().toLowerCase()
  const browserFingerprint = String(formData.get("browser_fingerprint") || "").slice(0, 4000)

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { state: "error", message: "Please enter a valid email address." }
  }

  try {
    const requestHeaders = await headers()
    const ipAddress = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "unknown"

    await sdk.auth.resetPassword("customer", "emailpass", {
      identifier: email,
      metadata: {
        request_id: randomUUID(),
        requested_at: new Date().toISOString(),
        ip_address: ipAddress.slice(0, 128),
        user_agent: (requestHeaders.get("user-agent") || "").slice(0, 1000),
        browser_fingerprint: browserFingerprint || "unavailable",
        country_code: String(formData.get("country_code") || "us").slice(0, 8),
      },
    })

    return { state: "success", message: "If an account exists for this email, we've sent a password reset link." }
  } catch {
    return { state: "error", message: "We couldn't send the reset email. Please try again shortly." }
  }
}

export async function completePasswordReset(
  _currentState: PasswordResetState,
  formData: FormData
): Promise<PasswordResetState> {
  const email = String(formData.get("email") || "").trim().toLowerCase()
  const token = String(formData.get("token") || "")
  const password = String(formData.get("password") || "")
  const confirmation = String(formData.get("confirm_password") || "")

  if (!email || !token) return { state: "error", message: "This reset link is invalid." }
  if (password.length < 8) return { state: "error", message: "Use at least 8 characters for your new password." }
  if (password !== confirmation) return { state: "error", message: "The passwords do not match." }

  try {
    await sdk.auth.updateProvider("customer", "emailpass", { password }, token)
    return { state: "success", message: "Your password has been updated. You can now sign in." }
  } catch {
    return { state: "error", message: "This reset link is invalid or has expired. Please request a new one." }
  }
}

// Requests a verification email for the given customer. The request must be
// authenticated with a token tied to the auth identity (the token returned by
// register or by a login that requires verification).
async function requestVerificationEmail(email: string, token: string) {
  await sdk.auth.verification.request(
    {
      entity_id: email,
      entity_type: "email",
      code_provider: "token",
    },
    {
      authorization: `Bearer ${token}`,
    }
  )
}

export const retrieveCustomer =
  async (): Promise<HttpTypes.StoreCustomer | null> => {
    const authHeaders = await getAuthHeaders()

    if (!("authorization" in authHeaders)) return null

    const headers = {
      ...authHeaders,
    }

    return await sdk.client
      .fetch<{ customer: HttpTypes.StoreCustomer }>(`/store/customers/me`, {
        method: "GET",
        query: {
          fields: "*orders",
        },
        headers,
        // Authentication state must never be served from a stale cache. An
        // expired JWT otherwise leaves the account UI visible while every
        // mutation correctly fails with 401.
        cache: "no-store",
      })
      .then(({ customer }) => customer)
      .catch(() => null)
  }

export const updateCustomer = async (body: HttpTypes.StoreUpdateCustomer) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  let updateRes: HttpTypes.StoreCustomer
  try {
    const { customer } = await sdk.store.customer.update(body, {}, headers)
    updateRes = customer
  } catch (error) {
    if (error instanceof FetchError && error.status === 401) {
      await removeAuthToken()
      throw new Error(
        "Your session has expired. Please sign in again, then retry the update."
      )
    }
    medusaError(error)
  }

  const cacheTag = await getCacheTag("customers")
  revalidateTag(cacheTag)

  return updateRes
}

export type AccountCredentialState = {
  success: boolean
  error: string | null
}

const accountErrorMessage = (error: unknown) => {
  if (error instanceof FetchError) {
    return error.message || "Unable to update your account. Please try again."
  }
  return error instanceof Error
    ? error.message
    : "Unable to update your account. Please try again."
}

export async function updateCustomerName(
  _currentState: AccountCredentialState,
  formData: FormData
): Promise<AccountCredentialState> {
  const firstName = String(formData.get("first_name") || "").trim()
  const lastName = String(formData.get("last_name") || "").trim()

  if (!firstName || !lastName) {
    return { success: false, error: "Please enter your first and last name." }
  }

  if (firstName.length > 255 || lastName.length > 255) {
    return {
      success: false,
      error: "First and last names must be 255 characters or fewer.",
    }
  }

  try {
    await updateCustomer({ first_name: firstName, last_name: lastName })
    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: accountErrorMessage(error) }
  }
}

export async function updateCustomerPhone(
  _currentState: AccountCredentialState,
  formData: FormData
): Promise<AccountCredentialState> {
  const phone = String(formData.get("phone") || "").trim()

  if (!phone) {
    return { success: false, error: "Please enter your phone number." }
  }

  if (phone.length > 30) {
    return {
      success: false,
      error: "The phone number must be 30 characters or fewer.",
    }
  }

  try {
    await updateCustomer({ phone })
    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: accountErrorMessage(error) }
  }
}

const refreshCustomerSession = async (email: string, password: string) => {
  const token = await sdk.auth.login("customer", "emailpass", {
    email,
    password,
  })

  if (typeof token !== "string") {
    throw new Error("Your account was updated, but a new session could not be created.")
  }

  await setAuthToken(token)
  const cacheTag = await getCacheTag("customers")
  revalidateTag(cacheTag)
}

export async function updateCustomerEmail(
  _currentState: AccountCredentialState,
  formData: FormData
): Promise<AccountCredentialState> {
  const email = String(formData.get("email") || "").trim().toLowerCase()
  const currentPassword = String(formData.get("current_password") || "")

  try {
    const headers = await getAuthHeaders()
    const result = await sdk.client.fetch<{ email: string }>(
      "/store/customers/me/account/email",
      {
        method: "POST",
        headers,
        body: { email, current_password: currentPassword },
      }
    )
    await refreshCustomerSession(result.email, currentPassword)
    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: accountErrorMessage(error) }
  }
}

export async function updateCustomerPassword(
  _currentState: AccountCredentialState,
  formData: FormData
): Promise<AccountCredentialState> {
  const currentPassword = String(formData.get("current_password") || "")
  const password = String(formData.get("password") || "")
  const confirmPassword = String(formData.get("confirm_password") || "")

  if (password !== confirmPassword) {
    return { success: false, error: "The new passwords do not match." }
  }
  if (password === currentPassword) {
    return {
      success: false,
      error: "The new password must be different from your current password.",
    }
  }

  try {
    const headers = await getAuthHeaders()
    const result = await sdk.client.fetch<{ email: string }>(
      "/store/customers/me/account/password",
      {
        method: "POST",
        headers,
        body: { current_password: currentPassword, password },
      }
    )
    await refreshCustomerSession(result.email, password)
    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: accountErrorMessage(error) }
  }
}

export async function signup(
  _currentState: unknown,
  formData: FormData
): Promise<CustomerAuthState> {
  const password = formData.get("password") as string
  const customerForm = {
    email: formData.get("email") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: formData.get("phone") as string,
  }

  try {
    await sdk.auth.register("customer", "emailpass", {
      email: customerForm.email,
      password,
    })
  } catch (error) {
    const fetchError = error as FetchError
    // An existing identity (for example, an admin user with the same email) is
    // expected and handled: the customer can still log in to link a customer
    // record. Any other error is surfaced.
    if (
      fetchError.statusText !== "Unauthorized" ||
      fetchError.message !== "Identity with email already exists"
    ) {
      return { state: "error", error: String(error) }
    }
  }

  // Persist the extra signup fields. The customer record is created during
  // login, which is deferred until after email verification when the backend
  // requires it.
  await setPendingCustomer(customerForm)

  // Continue by logging in. The login response tells us whether the backend
  // requires email verification — we don't need a storefront-side flag.
  return completeLogin(customerForm.email, password)
}

export async function login(
  _currentState: unknown,
  formData: FormData
): Promise<CustomerAuthState> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  return completeLogin(email, password)
}

// Logs the customer in and reconciles the customer record. The behavior is
// driven entirely by the backend's login response, so it works whether or not
// email verification is enabled.
async function completeLogin(
  email: string,
  password: string
): Promise<CustomerAuthState> {
  let result: Awaited<ReturnType<typeof sdk.auth.login>>

  try {
    result = await sdk.auth.login("customer", "emailpass", { email, password })
  } catch (error) {
    return { state: "error", error: String(error) }
  }

  // A `location` is returned by third-party auth providers, which this flow
  // doesn't support.
  if (typeof result === "object" && "location" in result) {
    return {
      state: "error",
      error: "This login method isn't supported by the storefront.",
    }
  }

  // The backend requires email verification and the customer hasn't verified
  // yet. Send the verification email and ask them to check their inbox.
  if (
    typeof result === "object" &&
    "verification_required" in result &&
    result.verification_required
  ) {
    try {
      await requestVerificationEmail(email, result.token)
    } catch {
      // Ignore: the customer can resend from the verification page.
    }
    return { state: "verification_required", email }
  }

  if (typeof result !== "string") {
    return {
      state: "error",
      error: "Authentication requires additional steps that aren't supported.",
    }
  }

  let token = result

  // The token may not be tied to a customer record yet — right after
  // registration, or after verifying a brand-new account. Ask the backend:
  // `/store/customers/me` rejects tokens without a registered actor, so a
  // failed retrieve means we still need to create the customer, then log in
  // again to obtain a customer-bound token.
  const customerExists = await sdk.store.customer
    .retrieve({}, { authorization: `Bearer ${token}` })
    .then(() => true)
    .catch(() => false)

  if (!customerExists) {
    const pending = await getPendingCustomer()

    try {
      await sdk.store.customer.create(
        {
          email,
          first_name: pending?.first_name,
          last_name: pending?.last_name,
          phone: pending?.phone,
        },
        {},
        { authorization: `Bearer ${token}` }
      )

      token = (await sdk.auth.login("customer", "emailpass", {
        email,
        password,
      })) as string
    } catch (error) {
      return { state: "error", error: String(error) }
    }

    await removePendingCustomer()
  }

  await setAuthToken(token)

  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)

  try {
    await transferCart()
  } catch (error) {
    return { state: "error", error: String(error) }
  }

  return { state: "success" }
}

// Confirms a customer's email using the token from the verification link.
//
// The confirm route doesn't require authentication, so this works even when the
// customer opens the link on a different device than the one they signed up on.
export async function confirmEmailVerification(
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await sdk.auth.verification.confirm({ code: token })
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function signout(countryCode: string) {
  await sdk.auth.logout()

  await removeAuthToken()

  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)

  await removeCartId()

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)

  redirect(`/${countryCode}/account`)
}

export async function transferCart() {
  const cartId = await getCartId()

  if (!cartId) {
    return
  }

  const headers = await getAuthHeaders()

  await sdk.store.cart.transferCart(cartId, {}, headers)

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)
}

export const addCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> => {
  const isDefaultBilling = (currentState.isDefaultBilling as boolean) || false
  const isDefaultShipping = (currentState.isDefaultShipping as boolean) || false

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
    is_default_billing: isDefaultBilling,
    is_default_shipping: isDefaultShipping,
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .createAddress(address, {}, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const deleteCustomerAddress = async (
  addressId: string
): Promise<void> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.customer
    .deleteAddress(addressId, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const updateCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> => {
  const addressId =
    (currentState.addressId as string) || (formData.get("addressId") as string)

  if (!addressId) {
    return { success: false, error: "Address ID is required" }
  }

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
  } as HttpTypes.StoreUpdateCustomerAddress

  const phone = formData.get("phone") as string

  if (phone) {
    address.phone = phone
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .updateAddress(addressId, address, {}, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}
