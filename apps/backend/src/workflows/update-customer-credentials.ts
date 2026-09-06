import type {
  IAuthModuleService,
  ICustomerModuleService,
} from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

type VerifiedCustomerCredentials = {
  customer_id: string
  email: string
  provider_identity_id: string
}

type VerifyCustomerCredentialsInput = {
  customer_id: string
  current_password: string
}

export type UpdateCustomerEmailInput = VerifyCustomerCredentialsInput & {
  email: string
}

export type UpdateCustomerPasswordInput = VerifyCustomerCredentialsInput & {
  password: string
}

const invalidCredentials = () =>
  new MedusaError(
    MedusaError.Types.UNAUTHORIZED,
    "The current password is incorrect."
  )

const verifyCustomerCredentials = async (
  input: VerifyCustomerCredentialsInput,
  authService: IAuthModuleService,
  customerService: ICustomerModuleService
): Promise<VerifiedCustomerCredentials> => {
  const customer = await customerService.retrieveCustomer(input.customer_id)
  const authentication = await authService.authenticate("emailpass", {
    body: {
      email: customer.email,
      password: input.current_password,
    },
  })

  if (
    !authentication.success ||
    authentication.authIdentity?.app_metadata?.customer_id !== input.customer_id
  ) {
    throw invalidCredentials()
  }

  const providerIdentity = authentication.authIdentity.provider_identities?.find(
    (identity) => identity.provider === "emailpass"
  )

  if (!providerIdentity) {
    throw invalidCredentials()
  }

  return {
    customer_id: input.customer_id,
    email: customer.email.toLowerCase(),
    provider_identity_id: providerIdentity.id,
  }
}

const updateCustomerEmailStep = createStep(
  "update-customer-email",
  async (input: UpdateCustomerEmailInput, { container }) => {
    const authService = container.resolve<IAuthModuleService>(Modules.AUTH)
    const customerService =
      container.resolve<ICustomerModuleService>(Modules.CUSTOMER)
    const verified = await verifyCustomerCredentials(
      input,
      authService,
      customerService
    )
    const nextEmail = input.email.trim().toLowerCase()

    if (verified.email === nextEmail) {
      return new StepResponse(
        { email: nextEmail },
        {
          customer_id: input.customer_id,
          previous_email: verified.email,
          provider_identity_id: verified.provider_identity_id,
        }
      )
    }

    const existing = await authService.listProviderIdentities({
      entity_id: nextEmail,
      provider: "emailpass",
    })
    if (existing.some((identity) => identity.id !== verified.provider_identity_id)) {
      throw new MedusaError(
        MedusaError.Types.CONFLICT,
        "An account with this email already exists."
      )
    }

    let identityUpdated = false
    try {
      await authService.updateProviderIdentities({
        id: verified.provider_identity_id,
        entity_id: nextEmail,
      })
      identityUpdated = true
      await customerService.updateCustomers(input.customer_id, { email: nextEmail })
    } catch (error) {
      if (identityUpdated) {
        await authService.updateProviderIdentities({
          id: verified.provider_identity_id,
          entity_id: verified.email,
        })
      }
      throw error
    }

    return new StepResponse(
      { email: nextEmail },
      {
        customer_id: input.customer_id,
        previous_email: verified.email,
        provider_identity_id: verified.provider_identity_id,
      }
    )
  },
  async (
    rollback:
      | {
          customer_id: string
          previous_email: string
          provider_identity_id: string
        }
      | undefined,
    { container }
  ) => {
    if (!rollback) return
    const authService = container.resolve<IAuthModuleService>(Modules.AUTH)
    const customerService =
      container.resolve<ICustomerModuleService>(Modules.CUSTOMER)
    await authService.updateProviderIdentities({
      id: rollback.provider_identity_id,
      entity_id: rollback.previous_email,
    })
    await customerService.updateCustomers(rollback.customer_id, {
      email: rollback.previous_email,
    })
  }
)

const updateCustomerPasswordStep = createStep(
  "update-customer-password",
  async (input: UpdateCustomerPasswordInput, { container }) => {
    const authService = container.resolve<IAuthModuleService>(Modules.AUTH)
    const customerService =
      container.resolve<ICustomerModuleService>(Modules.CUSTOMER)
    const verified = await verifyCustomerCredentials(
      input,
      authService,
      customerService
    )
    const result = await authService.updateProvider("emailpass", {
      entity_id: verified.email,
      password: input.password,
    })

    if (!result.success) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        result.error || "The password could not be updated."
      )
    }

    return new StepResponse({ email: verified.email })
  }
)

export const updateCustomerEmailWorkflow = createWorkflow(
  "update-customer-email",
  (input: UpdateCustomerEmailInput) =>
    new WorkflowResponse(updateCustomerEmailStep(input))
)

export const updateCustomerPasswordWorkflow = createWorkflow(
  "update-customer-password",
  (input: UpdateCustomerPasswordInput) =>
    new WorkflowResponse(updateCustomerPasswordStep(input))
)
