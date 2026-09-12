import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260912190957 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "pbn_checkout_error" drop constraint if exists "pbn_checkout_error_error_id_unique";`);
    this.addSql(`create table if not exists "pbn_checkout_error" ("id" text not null, "error_id" text not null, "resource" text check ("resource" in ('cart', 'shipping_options', 'payment_providers', 'store_credit')) not null, "code" text not null, "status_code" integer null, "retryable" boolean not null default true, "cart_id_hash" text null, "region_id" text null, "country_code" text null, "source" text not null default 'storefront', "occurred_at" timestamptz not null, "resolution_status" text check ("resolution_status" in ('open', 'resolved', 'ignored')) not null default 'open', "admin_note" text null, "resolved_by" text null, "resolved_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_checkout_error_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pbn_checkout_error_error_id_unique" ON "pbn_checkout_error" ("error_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_checkout_error_deleted_at" ON "pbn_checkout_error" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_checkout_error_resolution_occurred" ON "pbn_checkout_error" ("resolution_status", "occurred_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_checkout_error_resource_occurred" ON "pbn_checkout_error" ("resource", "occurred_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_checkout_error_code_occurred" ON "pbn_checkout_error" ("code", "occurred_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "pbn_checkout_error" cascade;`);
  }

}
