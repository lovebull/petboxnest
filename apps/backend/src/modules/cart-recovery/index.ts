import { Module } from "@medusajs/framework/utils"
import CartRecoveryModuleService from "./service"

export const CART_RECOVERY_MODULE = "cartRecovery"
export default Module(CART_RECOVERY_MODULE, { service: CartRecoveryModuleService })
