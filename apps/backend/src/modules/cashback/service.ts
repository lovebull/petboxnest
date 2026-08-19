import { MedusaService } from "@medusajs/framework/utils"

import { CashbackEntry, CashbackRule } from "./models"

class CashbackModuleService extends MedusaService({
  CashbackEntry,
  CashbackRule,
}) {}

export default CashbackModuleService
