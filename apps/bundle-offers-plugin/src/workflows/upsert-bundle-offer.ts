import type {
  IInventoryService,
  IProductModuleService,
  LinkDefinition,
} from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  StepResponse,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { batchLinksWorkflow } from "@medusajs/medusa/core-flows"
import { getPackInventoryError, hasDuplicateInventoryItems, inventoryLinkAction } from "../utils/inventory-safety"
import {
  BUNDLE_OFFERS_MODULE,
} from "../modules/bundle-offers"
import type BundleOffersModuleService from "../modules/bundle-offers/service"
import { retrieveBundleOfferDetail } from "../modules/bundle-offers/utils"
import type {
  BundleOfferComponentInput,
  BundleOfferDetail,
  UpsertBundleOfferInput,
} from "../types"

type LinkBatch = {
  create: LinkDefinition[]
  update: LinkDefinition[]
  delete: LinkDefinition[]
}

type NativeInventoryLink = {
  variant_id: string
  inventory_item_id: string
  required_quantity: number
}

type UpsertStepOutput = {
  offer: BundleOfferDetail
  links: LinkBatch
}

type UpsertCompensation = {
  current_offer_id: string
  previous: BundleOfferDetail | null
}

const normalizeOptional = (value?: string | null) => value?.trim() || null

const linkKey = (variantId: string, inventoryItemId: string) =>
  `${variantId}:${inventoryItemId}`

const componentMap = (offer: BundleOfferDetail | null) => {
  const result = new Map<
    string,
    NativeInventoryLink & {
      original_required_quantity: number | null
      link_created_by_offer: boolean
    }
  >()

  offer?.options.forEach((option) => {
    option.components.forEach((component) => {
      result.set(linkKey(option.variant_id, component.inventory_item_id), {
        variant_id: option.variant_id,
        inventory_item_id: component.inventory_item_id,
        required_quantity: component.required_quantity,
        original_required_quantity: component.original_required_quantity,
        link_created_by_offer: component.link_created_by_offer,
      })
    })
  })

  return result
}

const toLink = (
  value: {
    variant_id: string
    inventory_item_id: string
    required_quantity: number
  },
  includeData: boolean
): LinkDefinition => ({
  [Modules.PRODUCT]: { variant_id: value.variant_id },
  [Modules.INVENTORY]: { inventory_item_id: value.inventory_item_id },
  ...(includeData
    ? { data: { required_quantity: value.required_quantity } }
    : {}),
})

const buildLinkBatch = (
  previous: BundleOfferDetail | null,
  current: BundleOfferDetail,
  nativeLinks: Map<string, NativeInventoryLink>
): LinkBatch => {
  const before = componentMap(previous)
  const after = componentMap(current)
  const create: LinkDefinition[] = []
  const update: LinkDefinition[] = []
  const deleted: LinkDefinition[] = []

  after.forEach((component, key) => {
    // Compare with the live Medusa link, not the previous offer snapshot.
    // Otherwise an unchanged save cannot repair a link edited elsewhere.
    const action = inventoryLinkAction(nativeLinks.get(key)?.required_quantity, component.required_quantity)
    if (action === "create") create.push(toLink(component, true))
    if (action === "update") update.push(toLink(component, true))
  })

  before.forEach((component, key) => {
    if (!after.has(key)) {
      if (component.link_created_by_offer) {
        deleted.push(toLink(component, false))
      } else if (component.original_required_quantity) {
        update.push(
          toLink(
            {
              ...component,
              required_quantity: component.original_required_quantity,
            },
            true
          )
        )
      }
    }
  })

  return { create, update, delete: deleted }
}

async function replaceOfferChildren(
  service: BundleOffersModuleService,
  offerId: string,
  options: UpsertBundleOfferInput["options"],
  provenance = new Map<
    string,
    { original_required_quantity: number | null; link_created_by_offer: boolean }
  >()
) {
  const existingOptions = await service.listBundleOfferOptions({
    offer_id: offerId,
  })
  const existingOptionIds = existingOptions.map((option) => option.id)

  if (existingOptionIds.length) {
    const existingComponents = await service.listBundleOfferComponents({
      option_id: existingOptionIds,
    })
    if (existingComponents.length) {
      await service.deleteBundleOfferComponents(
        existingComponents.map((component) => component.id)
      )
    }
    await service.deleteBundleOfferOptions(existingOptionIds)
  }

  for (const [optionIndex, option] of options.entries()) {
    const [createdOption] = await service.createBundleOfferOptions([
      {
        offer_id: offerId,
        variant_id: option.variant_id,
        title: option.title.trim(),
        subtitle: normalizeOptional(option.subtitle),
        badge: normalizeOptional(option.badge),
        gift_label: normalizeOptional(option.gift_label),
        compare_at_prices: option.compare_at_prices || null,
        display_order: option.display_order ?? optionIndex,
        is_default: option.is_default ?? false,
        is_active: option.is_active ?? true,
      },
    ])

    if (option.components.length) {
      await service.createBundleOfferComponents(
        option.components.map((component, componentIndex) => ({
          option_id: createdOption.id,
          inventory_item_id: component.inventory_item_id,
          required_quantity: component.required_quantity,
          original_required_quantity:
            provenance.get(linkKey(option.variant_id, component.inventory_item_id))
              ?.original_required_quantity ?? null,
          link_created_by_offer:
            provenance.get(linkKey(option.variant_id, component.inventory_item_id))
              ?.link_created_by_offer ?? false,
          role: component.role,
          label: normalizeOptional(component.label),
          display_order: component.display_order ?? componentIndex,
        }))
      )
    }
  }
}

async function restoreOffer(
  service: BundleOffersModuleService,
  currentOfferId: string,
  previous: BundleOfferDetail | null
) {
  if (!previous) {
    await replaceOfferChildren(service, currentOfferId, [])
    await service.deleteBundleOffers(currentOfferId)
    return
  }

  await service.updateBundleOffers({
    id: previous.id,
    product_id: previous.product_id,
    title: previous.title,
    subtitle: previous.subtitle,
    status: previous.status,
    starts_at: previous.starts_at ? new Date(previous.starts_at) : null,
    ends_at: previous.ends_at ? new Date(previous.ends_at) : null,
    updated_by: previous.updated_by,
  })

  const provenance = new Map(
    previous.options.flatMap((option) =>
      option.components.map((component) => [
        linkKey(option.variant_id, component.inventory_item_id),
        {
          original_required_quantity: component.original_required_quantity,
          link_created_by_offer: component.link_created_by_offer,
        },
      ] as const)
    )
  )
  await replaceOfferChildren(
    service,
    previous.id,
    previous.options.map((option) => ({
      variant_id: option.variant_id,
      title: option.title,
      subtitle: option.subtitle,
      badge: option.badge,
      gift_label: option.gift_label,
      compare_at_prices: option.compare_at_prices,
      display_order: option.display_order,
      is_default: option.is_default,
      is_active: option.is_active,
      components: option.components.map((component) => ({
        inventory_item_id: component.inventory_item_id,
        required_quantity: component.required_quantity,
        role: component.role,
        label: component.label,
        display_order: component.display_order,
      })),
    })),
    provenance
  )
}

const validateInput = async (
  input: UpsertBundleOfferInput,
  productService: IProductModuleService,
  inventoryService: IInventoryService
) => {
  if (!input.options.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "A bundle offer must contain at least one option."
    )
  }

  const defaultCount = input.options.filter(
    (option) => option.is_active !== false && option.is_default
  ).length
  if (defaultCount > 1) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Only one active bundle option can be the default."
    )
  }

  if (
    input.starts_at &&
    input.ends_at &&
    new Date(input.starts_at) >= new Date(input.ends_at)
  ) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "The offer end date must be later than its start date."
    )
  }

  await productService.retrieveProduct(input.product_id, { select: ["id"] })
  const variantIds = input.options.map((option) => option.variant_id)
  if (new Set(variantIds).size !== variantIds.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Each product variant can only be used once in an offer."
    )
  }
  const variants = await productService.listProductVariants({
    id: variantIds,
    product_id: input.product_id,
  })
  if (variants.length !== variantIds.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Every offer option must reference a variant of the selected product."
    )
  }

  const components = input.options.flatMap((option) => option.components)
  if (input.options.some((option) => hasDuplicateInventoryItems(option.components))) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA,
      "同一库存项请合并填写发货总数（含赠品） / Combine paid and free quantities for the same inventory item into one component.")
  }
  components.forEach((component: BundleOfferComponentInput) => {
    if (!Number.isInteger(component.required_quantity) || component.required_quantity < 1) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Component quantities must be positive integers."
      )
    }
  })
  const itemIds = [...new Set(components.map((component) => component.inventory_item_id))]
  if (itemIds.length) {
    const items = await inventoryService.listInventoryItems({ id: itemIds })
    if (items.length !== itemIds.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "One or more inventory items no longer exist."
      )
    }
  }
}

const upsertBundleOfferStep = createStep(
  "upsert-bundle-offer-records",
  async (input: UpsertBundleOfferInput, { container }) => {
    const service = container.resolve<BundleOffersModuleService>(
      BUNDLE_OFFERS_MODULE
    )
    const productService = container.resolve<IProductModuleService>(
      Modules.PRODUCT
    )
    const inventoryService = container.resolve<IInventoryService>(
      Modules.INVENTORY
    )

    await validateInput(input, productService, inventoryService)

    const previous = await retrieveBundleOfferDetail(
      service,
      input.id ? { id: input.id } : { product_id: input.product_id }
    )

    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const variantIds = input.options.map((option) => option.variant_id)
    const { data: nativeVariants } = await query.graph({
      entity: "variant",
      fields: [
        "id",
        "metadata",
        "inventory_items.inventory_item_id",
        "inventory_items.required_quantity",
      ],
      filters: { id: variantIds },
    })
    const nativeLinks = new Map<string, NativeInventoryLink>()
    ;(nativeVariants as Array<{
      id: string
      inventory_items?: Array<{
        inventory_item_id: string
        required_quantity: number
      }>
    }>).forEach((variant) => {
      variant.inventory_items?.forEach((item) => {
        nativeLinks.set(linkKey(variant.id, item.inventory_item_id), {
          variant_id: variant.id,
          inventory_item_id: item.inventory_item_id,
          required_quantity: item.required_quantity,
        })
      })
    })
    for (const option of input.options) {
      const variant = nativeVariants.find((item) => item.id === option.variant_id)
      const error = getPackInventoryError(
        variant?.metadata as Record<string, unknown> | null | undefined,
        variant?.inventory_items || [], option.components
      )
      if (error) throw new MedusaError(MedusaError.Types.INVALID_DATA, error)
    }
    if (previous && previous.product_id !== input.product_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "An existing bundle offer cannot be moved to another product."
      )
    }

    const values = {
      product_id: input.product_id,
      title: input.title.trim(),
      subtitle: normalizeOptional(input.subtitle),
      status: input.status,
      starts_at: input.starts_at ? new Date(input.starts_at) : null,
      ends_at: input.ends_at ? new Date(input.ends_at) : null,
      updated_by: input.updated_by || null,
    }
    const offer = previous
      ? await service.updateBundleOffers({ id: previous.id, ...values })
      : (await service.createBundleOffers([values]))[0]

    const previousComponents = componentMap(previous)
    const provenance = new Map<
      string,
      { original_required_quantity: number | null; link_created_by_offer: boolean }
    >()
    input.options.forEach((option) => {
      option.components.forEach((component) => {
        const key = linkKey(option.variant_id, component.inventory_item_id)
        const old = previousComponents.get(key)
        const native = nativeLinks.get(key)
        provenance.set(
          key,
          old
            ? {
                original_required_quantity: old.original_required_quantity,
                link_created_by_offer: old.link_created_by_offer,
              }
            : native
              ? {
                  original_required_quantity: native.required_quantity,
                  link_created_by_offer: false,
                }
              : {
                  original_required_quantity: null,
                  link_created_by_offer: true,
                }
        )
      })
    })
    await replaceOfferChildren(service, offer.id, input.options, provenance)
    const current = await retrieveBundleOfferDetail(service, { id: offer.id })
    if (!current) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "The bundle offer could not be reloaded after saving."
      )
    }

    return new StepResponse<UpsertStepOutput, UpsertCompensation>(
      { offer: current, links: buildLinkBatch(previous, current, nativeLinks) },
      { current_offer_id: offer.id, previous }
    )
  },
  async (compensation, { container }) => {
    if (!compensation) {
      return
    }
    const service = container.resolve<BundleOffersModuleService>(
      BUNDLE_OFFERS_MODULE
    )
    await restoreOffer(
      service,
      compensation.current_offer_id,
      compensation.previous
    )
  }
)

export const upsertBundleOfferWorkflow = createWorkflow(
  "upsert-bundle-offer",
  function (input: UpsertBundleOfferInput) {
    const saved = upsertBundleOfferStep(input)
    const linkInput = transform({ saved }, ({ saved }) => saved.links)
    batchLinksWorkflow.runAsStep({ input: linkInput })
    const offer = transform({ saved }, ({ saved }) => saved.offer)
    return new WorkflowResponse(offer)
  }
)
