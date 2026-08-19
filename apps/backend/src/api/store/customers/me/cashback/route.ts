import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { CASHBACK_MODULE } from "../../../../../modules/cashback"
import type CashbackModuleService from "../../../../../modules/cashback/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const cashbackService = req.scope.resolve<CashbackModuleService>(
    CASHBACK_MODULE
  )
  const entries = await cashbackService.listCashbackEntries(
    { customer_id: req.auth_context.actor_id },
    { take: 100, order: { created_at: "DESC" } }
  )

  res.json({ cashback_entries: entries })
}
