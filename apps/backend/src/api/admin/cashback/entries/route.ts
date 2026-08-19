import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { CASHBACK_MODULE } from "../../../../modules/cashback"
import type CashbackModuleService from "../../../../modules/cashback/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const cashbackService = req.scope.resolve<CashbackModuleService>(
    CASHBACK_MODULE
  )
  const { status, limit, offset } = req.validatedQuery as {
    status?: string
    limit: number
    offset: number
  }
  const filters = status ? { status } : {}
  const [entries, count] = await cashbackService.listAndCountCashbackEntries(
    filters,
    {
      take: limit,
      skip: offset,
      order: { created_at: "DESC" },
    }
  )

  res.json({ cashback_entries: entries, count, limit, offset })
}
