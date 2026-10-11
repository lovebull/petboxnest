import { MedusaService } from "@medusajs/framework/utils"
import { BundleOffer, BundleOfferComponent, BundleOfferOption } from "./models"

class BundleOffersModuleService extends MedusaService({
  BundleOffer,
  BundleOfferOption,
  BundleOfferComponent,
}) {}

export default BundleOffersModuleService
