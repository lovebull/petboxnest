import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261013020817 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "pbn_sales_analytics_setting" drop constraint if exists "pbn_sales_analytics_setting_key_unique";`);
    this.addSql(`create table if not exists "pbn_sales_analytics_setting" ("id" text not null, "key" text not null, "require_cookie_consent" boolean not null default true, "updated_by" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_sales_analytics_setting_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pbn_sales_analytics_setting_key_unique" ON "pbn_sales_analytics_setting" ("key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_sales_analytics_setting_deleted_at" ON "pbn_sales_analytics_setting" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "pbn_sales_analytics_setting" cascade;`);
  }

}
