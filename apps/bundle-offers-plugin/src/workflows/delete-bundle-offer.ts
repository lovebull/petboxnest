import type { LinkDefinition } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  StepResponse,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { batchLinksWorkflow } from "@medusajs/medusa/core-flows"
import { BUNDLE_OFFERS_MODULE } from "../modules/bundle-offers"
import type BundleOffersModuleService from "../modules/bundle-offers/service"
import { retrieveBundleOfferDetail } from "../modules/bundle-offers/utils"
import type { BundleOfferDetail } from "../types"

const deleteBundleOfferStep = createStep(
  "delete-bundle-offer-records",
  async (id: string, { container }) => {
    const service = container.resolve<BundleOffersModuleService>(
      BUNDLE_OFFERS_MODULE
    )
    const offer = await retrieveBundleOfferDetail(service, { id })
    if (!offer) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, "Bundle offer not found.")
    }
    const deleteLinks: LinkDefinition[] = []
    const restoreLinks: LinkDefinition[] = []
    offer.options.forEach((option) => {
      option.components.forEach((component) => {
        const link = {
          [Modules.PRODUCT]: { variant_id: option.variant_id },
          [Modules.INVENTORY]: {
            inventory_item_id: component.inventory_item_id,
          },
        }
        if (component.link_created_by_offer) {
          deleteLinks.push(link)
        } else if (component.original_required_quantity) {
          restoreLinks.push({
            ...link,
            data: {
              required_quantity: component.original_required_quantity,
            },
          })
        }
      })
    })
    const componentIds = offer.options.flatMap((option) =>
      option.components.map((component) => component.id)
    )
    if (componentIds.length) {
      await service.deleteBundleOfferComponents(componentIds)
    }
    if (offer.options.length) {
      await service.deleteBundleOfferOptions(
        offer.options.map((option) => option.id)
      )
    }
    await service.deleteBundleOffers(id)

    return new StepResponse({ id, deleteLinks, restoreLinks }, offer)
  },
  async (offer: BundleOfferDetail | undefined, { container }) => {
    if (!offer) {
      return
    }
    const service = container.resolve<BundleOffersModuleService>(
      BUNDLE_OFFERS_MODULE
    )
    await service.restoreBundleOffers(offer.id)
    const optionIds = offer.options.map((option) => option.id)
    const componentIds = offer.options.flatMap((option) =>
      option.components.map((component) => component.id)
    )
    if (optionIds.length) {
      await service.restoreBundleOfferOptions(optionIds)
    }
    if (componentIds.length) {
      await service.restoreBundleOfferComponents(componentIds)
    }
  }
)

export const deleteBundleOfferWorkflow = createWorkflow(
  "delete-bundle-offer",
  function (input: { id: string }) {
    const deleted = deleteBundleOfferStep(input.id)
    const links = transform({ deleted }, ({ deleted }) => ({
      create: [],
      update: deleted.restoreLinks,
      delete: deleted.deleteLinks,
    }))
    batchLinksWorkflow.runAsStep({ input: links })
    return new WorkflowResponse(
      transform({ deleted }, ({ deleted }) => ({ id: deleted.id }))
    )
  }
)
