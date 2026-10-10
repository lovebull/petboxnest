import { Module } from "@medusajs/framework/utils"
import ProductSupplierModuleService from "./service"

export const PRODUCT_SUPPLIER_MODULE = "productSupplier"

export default Module(PRODUCT_SUPPLIER_MODULE, {
  service: ProductSupplierModuleService,
})
