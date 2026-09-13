import {
  InjectManager,
  MedusaContext,
  MedusaService,
} from "@medusajs/framework/utils";
import type { Context } from "@medusajs/framework/types";
import { CheckoutError } from "./models";

class CheckoutErrorModuleService extends MedusaService({ CheckoutError }) {
  @InjectManager()
  async searchCheckoutErrorIds(
    search: string,
    @MedusaContext() sharedContext: Context = {},
  ): Promise<string[]> {
    const manager = sharedContext.manager as {
      getConnection: () => {
        execute: (
          sql: string,
          parameters: unknown[],
        ) => Promise<Array<{ id: string }>>;
      };
    };
    const rows = await manager.getConnection().execute(
      `select id
       from pbn_checkout_error
       where deleted_at is null
         and (
           error_id ilike ?
           or code ilike ?
           or coalesce(cart_id_hash, '') ilike ?
           or coalesce(region_id, '') ilike ?
           or coalesce(route_key, '') ilike ?
           or coalesce(digest, '') ilike ?
         )`,
      Array(6).fill(`%${search}%`),
    );
    return rows.map((row) => row.id);
  }

  @InjectManager()
  async getCheckoutErrorSummary(
    @MedusaContext() sharedContext: Context = {},
  ): Promise<{
    total: number;
    open: number;
    resolved: number;
    ignored: number;
  }> {
    const manager = sharedContext.manager as {
      getConnection: () => {
        execute: (
          sql: string,
        ) => Promise<Array<Record<string, number | string>>>;
      };
    };
    const [row] = await manager.getConnection().execute(
      `select
         count(*)::integer as total,
         count(*) filter (where resolution_status = 'open')::integer as open,
         count(*) filter (where resolution_status = 'resolved')::integer as resolved,
         count(*) filter (where resolution_status = 'ignored')::integer as ignored
       from pbn_checkout_error
       where deleted_at is null`,
    );
    return {
      total: Number(row.total),
      open: Number(row.open),
      resolved: Number(row.resolved),
      ignored: Number(row.ignored),
    };
  }
}

export default CheckoutErrorModuleService;
