import {
  InjectManager,
  MedusaContext,
  MedusaService,
} from "@medusajs/framework/utils"
import type { Context } from "@medusajs/framework/types"
import { StorefrontError } from "./models"

class StorefrontErrorModuleService extends MedusaService({ StorefrontError }) {
  @InjectManager()
  async searchStorefrontErrorIds(
    search: string,
    @MedusaContext() sharedContext: Context = {},
  ): Promise<string[]> {
    const manager = sharedContext.manager as {
      getConnection: () => {
        execute: (sql: string, parameters: unknown[]) => Promise<Array<{ id: string }>>
      }
    }
    const rows = await manager.getConnection().execute(
      `select id from pbn_storefront_error
       where deleted_at is null and (
         error_id ilike ? or code ilike ? or route_key ilike ?
         or coalesce(digest, '') ilike ?
       )`,
      Array(4).fill(`%${search}%`),
    )
    return rows.map((row) => row.id)
  }

  @InjectManager()
  async getStorefrontErrorSummary(
    @MedusaContext() sharedContext: Context = {},
  ): Promise<{ total: number; open: number; resolved: number; ignored: number }> {
    const manager = sharedContext.manager as {
      getConnection: () => { execute: (sql: string) => Promise<Array<Record<string, number | string>>> }
    }
    const [row] = await manager.getConnection().execute(
      `select count(*)::integer as total,
        count(*) filter (where resolution_status = 'open')::integer as open,
        count(*) filter (where resolution_status = 'resolved')::integer as resolved,
        count(*) filter (where resolution_status = 'ignored')::integer as ignored
       from pbn_storefront_error where deleted_at is null`,
    )
    return {
      total: Number(row.total),
      open: Number(row.open),
      resolved: Number(row.resolved),
      ignored: Number(row.ignored),
    }
  }
}

export default StorefrontErrorModuleService
