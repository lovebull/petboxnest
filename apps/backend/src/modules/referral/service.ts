import { MedusaService } from "@medusajs/framework/utils"

import {
  CommissionLedgerEntry,
  ReferralAttribution,
  ReferralConversion,
  ReferralParticipant,
  ReferralProgram,
} from "./models"

class ReferralModuleService extends MedusaService({
  CommissionLedgerEntry,
  ReferralAttribution,
  ReferralConversion,
  ReferralParticipant,
  ReferralProgram,
}) {}

export default ReferralModuleService
