import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { updateRegionsWorkflow } from "@medusajs/medusa/core-flows"

const PAYPAL_WALLET_PROVIDER_ID = "pp_paypal_paypal"

type RegionWithPaymentProviders = {
  id: string
  name: string
  currency_code: string
  payment_providers?: Array<{ id: string }>
}

export default async function enablePayPalWallet({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code", "payment_providers.id"],
    filters: {
      currency_code: "usd",
    },
  })

  const regions = data as RegionWithPaymentProviders[]

  if (!regions.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "No USD region was found for PayPal Wallet"
    )
  }

  for (const region of regions) {
    const providerIds = (region.payment_providers ?? []).map(
      (provider) => provider.id
    )

    if (providerIds.includes(PAYPAL_WALLET_PROVIDER_ID)) {
      logger.info(`PayPal Wallet is already enabled for ${region.name}`)
      continue
    }

    await updateRegionsWorkflow(container).run({
      input: {
        selector: { id: region.id },
        update: {
          payment_providers: [...providerIds, PAYPAL_WALLET_PROVIDER_ID],
        },
      },
    })

    logger.info(`Enabled PayPal Wallet for ${region.name}`)
  }
}
