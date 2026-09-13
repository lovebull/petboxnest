import { InjectManager, MedusaContext, MedusaService } from "@medusajs/framework/utils"
import type { Context } from "@medusajs/framework/types"
import { CartRecovery, CartRecoveryLog } from "./models"

class CartRecoveryModuleService extends MedusaService({ CartRecovery, CartRecoveryLog }) {
  @InjectManager()
  async consumeToken(
    id: string,
    tokenHash: string,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<{ id: string; cart_id: string; country_code: string | null; send_count: number } | null> {
    const manager = sharedContext.manager as any
    const rows = await manager.getConnection().execute(
      `update pbn_cart_recovery
       set status = 'recovered', recovered_at = now(), updated_at = now()
       where id = ? and token_hash = ? and status = 'sent'
         and token_expires_at > now() and deleted_at is null
       returning id, cart_id, country_code, send_count`,
      [id, tokenHash]
    )
    return rows[0] || null
  }

  @InjectManager()
  async getSummary(@MedusaContext() sharedContext: Context = {}) {
    const manager = sharedContext.manager as any
    const [row] = await manager.getConnection().execute(
      `select count(*)::integer as total,
        count(*) filter (where status in ('eligible', 'sent'))::integer as active,
        count(*) filter (where status = 'sent')::integer as sent,
        count(*) filter (where status = 'recovered')::integer as recovered,
        count(*) filter (where status = 'unsubscribed')::integer as unsubscribed
       from pbn_cart_recovery where deleted_at is null`
    )
    return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, Number(value)]))
  }

  @InjectManager()
  async searchIds(search: string, @MedusaContext() sharedContext: Context = {}) {
    const manager = sharedContext.manager as any
    const rows = await manager.getConnection().execute(
      `select id from pbn_cart_recovery
       where deleted_at is null and (email ilike ? or cart_id ilike ?)`,
      [`%${search}%`, `%${search}%`]
    )
    return rows.map((row: { id: string }) => row.id)
  }
}

export default CartRecoveryModuleService
