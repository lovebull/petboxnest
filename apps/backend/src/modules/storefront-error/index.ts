import { Module } from "@medusajs/framework/utils"
import StorefrontErrorModuleService from "./service"

export const STOREFRONT_ERROR_MODULE = "storefrontError"

export default Module(STOREFRONT_ERROR_MODULE, {
  service: StorefrontErrorModuleService,
})
