import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import ProductSupplierModule from "../modules/product-supplier"

export default defineLink(
  ProductModule.linkable.product,
  ProductSupplierModule.linkable.productSupplierSource
)
