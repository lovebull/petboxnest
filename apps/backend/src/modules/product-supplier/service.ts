import { MedusaService } from "@medusajs/framework/utils"
import { ProductSupplierSource } from "./models"

class ProductSupplierModuleService extends MedusaService({
  ProductSupplierSource,
}) {}

export default ProductSupplierModuleService
