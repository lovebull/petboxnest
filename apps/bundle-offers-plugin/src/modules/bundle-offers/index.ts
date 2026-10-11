import { Module } from "@medusajs/framework/utils"
import BundleOffersModuleService from "./service"

export const BUNDLE_OFFERS_MODULE = "bundleOffers"

export default Module(BUNDLE_OFFERS_MODULE, {
  service: BundleOffersModuleService,
})
