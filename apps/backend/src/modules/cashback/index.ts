import { Module } from "@medusajs/framework/utils"

import CashbackModuleService from "./service"

export const CASHBACK_MODULE = "cashback"

export default Module(CASHBACK_MODULE, {
  service: CashbackModuleService,
})
