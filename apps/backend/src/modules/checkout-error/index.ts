import { Module } from "@medusajs/framework/utils"
import CheckoutErrorModuleService from "./service"

export const CHECKOUT_ERROR_MODULE = "checkoutError"

export default Module(CHECKOUT_ERROR_MODULE, {
  service: CheckoutErrorModuleService,
})
