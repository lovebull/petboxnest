import { InjectManager, MedusaContext, MedusaService } from "@medusajs/framework/utils"
import type { Context } from "@medusajs/framework/types"
import { RestockNotificationLog, RestockSubscription } from "./models"

class RestockModuleService extends MedusaService({ RestockSubscription, RestockNotificationLog }) {
  @InjectManager()
  async getSummary(@MedusaContext() sharedContext: Context = {}) {
    const manager = sharedContext.manager as any
    const [row] = await manager.getConnection().execute(
      `select count(*)::integer as total,
        count(*) filter (where status = 'active')::integer as active,
        count(*) filter (where status = 'notified')::integer as notified,
        count(*) filter (where status = 'unsubscribed')::integer as unsubscribed
       from pbn_restock_subscription where deleted_at is null`
    )
    return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, Number(value)]))
  }

  @InjectManager()
  async searchIds(search: string, @MedusaContext() sharedContext: Context = {}) {
    const manager = sharedContext.manager as any
    const rows = await manager.getConnection().execute(
      `select id from pbn_restock_subscription
       where deleted_at is null and (email ilike ? or variant_id ilike ?)`,
      [`%${search}%`, `%${search}%`]
    )
    return rows.map((row: { id: string }) => row.id)
  }
}

export default RestockModuleService
