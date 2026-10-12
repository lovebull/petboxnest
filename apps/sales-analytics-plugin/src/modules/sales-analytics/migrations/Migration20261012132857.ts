import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261012132857 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "pbn_sales_sync_state" drop constraint if exists "pbn_sales_sync_state_sync_key_unique";`);
    this.addSql(`alter table if exists "pbn_sales_order_fact" drop constraint if exists "pbn_sales_order_fact_order_id_unique";`);
    this.addSql(`alter table if exists "pbn_sales_daily_metric" drop constraint if exists "pbn_sales_daily_metric_metric_key_unique";`);
    this.addSql(`alter table if exists "pbn_sales_customer_fact" drop constraint if exists "pbn_sales_customer_fact_customer_key_unique";`);
    this.addSql(`create table if not exists "pbn_sales_customer_fact" ("id" text not null, "customer_key" text not null, "customer_id" text null, "first_order_at" timestamptz not null, "last_order_at" timestamptz not null, "order_count" integer not null default 0, "lifetime_sales_by_currency" jsonb not null default '{}', "calculated_at" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_sales_customer_fact_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pbn_sales_customer_fact_customer_key_unique" ON "pbn_sales_customer_fact" ("customer_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_sales_customer_fact_deleted_at" ON "pbn_sales_customer_fact" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_sales_customer_last_order" ON "pbn_sales_customer_fact" ("last_order_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "pbn_sales_daily_metric" ("id" text not null, "metric_key" text not null, "metric_date" text not null, "currency_code" text not null, "gross_sales" numeric not null default 0, "discounts" numeric not null default 0, "refunds" numeric not null default 0, "net_sales" numeric not null default 0, "shipping_total" numeric not null default 0, "tax_total" numeric not null default 0, "total_sales" numeric not null default 0, "order_count" integer not null default 0, "units_sold" integer not null default 0, "fully_shipped_orders" integer not null default 0, "partially_shipped_orders" integer not null default 0, "customer_count" integer not null default 0, "returning_customer_count" integer not null default 0, "calculated_at" timestamptz not null, "raw_gross_sales" jsonb not null default '{"value":"0","precision":20}', "raw_discounts" jsonb not null default '{"value":"0","precision":20}', "raw_refunds" jsonb not null default '{"value":"0","precision":20}', "raw_net_sales" jsonb not null default '{"value":"0","precision":20}', "raw_shipping_total" jsonb not null default '{"value":"0","precision":20}', "raw_tax_total" jsonb not null default '{"value":"0","precision":20}', "raw_total_sales" jsonb not null default '{"value":"0","precision":20}', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_sales_daily_metric_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pbn_sales_daily_metric_metric_key_unique" ON "pbn_sales_daily_metric" ("metric_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_sales_daily_metric_deleted_at" ON "pbn_sales_daily_metric" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_sales_daily_date_currency" ON "pbn_sales_daily_metric" ("metric_date", "currency_code") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "pbn_sales_order_fact" ("id" text not null, "order_id" text not null, "display_id" integer not null, "customer_id" text null, "customer_key" text null, "currency_code" text not null, "status" text not null, "payment_status" text null, "fulfillment_status" text null, "order_day" text not null, "ordered_at" timestamptz not null, "gross_sales" numeric not null default 0, "discounts" numeric not null default 0, "refunds" numeric not null default 0, "net_sales" numeric not null default 0, "shipping_total" numeric not null default 0, "tax_total" numeric not null default 0, "total_sales" numeric not null default 0, "units_ordered" integer not null default 0, "units_returned" integer not null default 0, "units_sold" integer not null default 0, "is_valid" boolean not null default true, "is_returning_customer" boolean not null default false, "synced_at" timestamptz not null, "raw_gross_sales" jsonb not null default '{"value":"0","precision":20}', "raw_discounts" jsonb not null default '{"value":"0","precision":20}', "raw_refunds" jsonb not null default '{"value":"0","precision":20}', "raw_net_sales" jsonb not null default '{"value":"0","precision":20}', "raw_shipping_total" jsonb not null default '{"value":"0","precision":20}', "raw_tax_total" jsonb not null default '{"value":"0","precision":20}', "raw_total_sales" jsonb not null default '{"value":"0","precision":20}', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_sales_order_fact_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pbn_sales_order_fact_order_id_unique" ON "pbn_sales_order_fact" ("order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_sales_order_fact_deleted_at" ON "pbn_sales_order_fact" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_sales_fact_day_currency" ON "pbn_sales_order_fact" ("order_day", "currency_code") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_sales_fact_customer" ON "pbn_sales_order_fact" ("customer_key", "ordered_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_sales_fact_status" ON "pbn_sales_order_fact" ("status", "ordered_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_sales_fact_fulfillment" ON "pbn_sales_order_fact" ("fulfillment_status", "ordered_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "pbn_sales_sync_state" ("id" text not null, "sync_key" text not null, "status" text check ("status" in ('idle', 'running', 'completed', 'failed')) not null default 'idle', "last_started_at" timestamptz null, "last_completed_at" timestamptz null, "last_error" text null, "processed_count" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_sales_sync_state_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pbn_sales_sync_state_sync_key_unique" ON "pbn_sales_sync_state" ("sync_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_sales_sync_state_deleted_at" ON "pbn_sales_sync_state" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "pbn_sales_customer_fact" cascade;`);

    this.addSql(`drop table if exists "pbn_sales_daily_metric" cascade;`);

    this.addSql(`drop table if exists "pbn_sales_order_fact" cascade;`);

    this.addSql(`drop table if exists "pbn_sales_sync_state" cascade;`);
  }

}
