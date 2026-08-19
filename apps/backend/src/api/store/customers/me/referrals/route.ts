import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { REFERRAL_MODULE } from "../../../../../modules/referral"
import type ReferralModuleService from "../../../../../modules/referral/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const service = req.scope.resolve<ReferralModuleService>(REFERRAL_MODULE)
  const customerId = req.auth_context.actor_id
  const [participant] = await service.listReferralParticipants({
    customer_id: customerId,
  })
  const [program] = await service.listReferralPrograms({ key: "default" })
  const conversions = await service.listReferralConversions(
    { referrer_customer_id: customerId },
    { take: 100, order: { created_at: "DESC" } }
  )
  const ledger = await service.listCommissionLedgerEntries(
    { customer_id: customerId },
    { take: 200, order: { created_at: "DESC" } }
  )

  res.json({
    referral_participant: participant || null,
    referral_program: program
      ? {
          commission_percentage: program.commission_percentage,
          referee_discount_percentage: program.referee_discount_percentage,
          waiting_days: program.waiting_days,
          minimum_order_amount: program.minimum_order_amount,
          maximum_commission_amount: program.maximum_commission_amount,
          currency_code: program.currency_code,
        }
      : null,
    referral_conversions: conversions,
    commission_ledger: ledger,
  })
}
