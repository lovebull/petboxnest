import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261013075255 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "pbn_storefront_analytics_event" add column if not exists "request_ip_hash" text null, add column if not exists "deduplication_key" text null;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_storefront_event_ip_time" ON "pbn_storefront_analytics_event" ("request_ip_hash", "occurred_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_pbn_storefront_event_deduplication_key" ON "pbn_storefront_analytics_event" ("deduplication_key") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_pbn_storefront_event_ip_time";`);
    this.addSql(`drop index if exists "UQ_pbn_storefront_event_deduplication_key";`);
    this.addSql(`alter table if exists "pbn_storefront_analytics_event" drop column if exists "request_ip_hash", drop column if exists "deduplication_key";`);
  }

}
