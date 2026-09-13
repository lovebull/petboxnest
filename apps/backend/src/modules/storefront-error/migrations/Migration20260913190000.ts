import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260913190000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create table if not exists "pbn_storefront_error" ("id" text not null, "error_id" text not null, "scope" text check ("scope" in ('root', 'country', 'main', 'product-detail', 'articles', 'account', 'cart', 'checkout')) not null, "code" text not null, "retryable" boolean not null default true, "country_code" text null, "route_key" text not null, "digest" text null, "source" text not null default 'storefront', "occurred_at" timestamptz not null, "resolution_status" text check ("resolution_status" in ('open', 'resolved', 'ignored')) not null default 'open', "admin_note" text null, "resolved_by" text null, "resolved_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_storefront_error_pkey" primary key ("id"));`)
    this.addSql(`create unique index if not exists "IDX_pbn_storefront_error_error_id_unique" on "pbn_storefront_error" ("error_id") where deleted_at is null;`)
    this.addSql(`create index if not exists "IDX_pbn_storefront_error_deleted_at" on "pbn_storefront_error" ("deleted_at") where deleted_at is null;`)
    this.addSql(`create index if not exists "IDX_pbn_storefront_error_resolution_occurred" on "pbn_storefront_error" ("resolution_status", "occurred_at") where deleted_at is null;`)
    this.addSql(`create index if not exists "IDX_pbn_storefront_error_scope_occurred" on "pbn_storefront_error" ("scope", "occurred_at") where deleted_at is null;`)
    this.addSql(`create index if not exists "IDX_pbn_storefront_error_code_occurred" on "pbn_storefront_error" ("code", "occurred_at") where deleted_at is null;`)
    this.addSql(`insert into "pbn_storefront_error" ("id", "error_id", "scope", "code", "retryable", "country_code", "route_key", "digest", "source", "occurred_at", "resolution_status", "admin_note", "resolved_by", "resolved_at", "created_at", "updated_at", "deleted_at") select "id", "error_id", coalesce(nullif("route_key", ''), 'main'), "code", "retryable", "country_code", coalesce(nullif("route_key", ''), 'main'), "digest", "source", "occurred_at", "resolution_status", "admin_note", "resolved_by", "resolved_at", "created_at", "updated_at", "deleted_at" from "pbn_checkout_error" where "resource" = 'route_render' on conflict do nothing;`)
    this.addSql(`delete from "pbn_checkout_error" where "resource" = 'route_render';`)
    this.addSql(`alter table if exists "pbn_checkout_error" drop constraint if exists "pbn_checkout_error_resource_check";`)
    this.addSql(`alter table if exists "pbn_checkout_error" add constraint "pbn_checkout_error_resource_check" check("resource" in ('cart', 'shipping_options', 'payment_providers', 'store_credit'));`)
    this.addSql(`alter table if exists "pbn_checkout_error" drop column if exists "route_key", drop column if exists "digest";`)
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "pbn_checkout_error" add column if not exists "route_key" text null, add column if not exists "digest" text null;`)
    this.addSql(`alter table if exists "pbn_checkout_error" drop constraint if exists "pbn_checkout_error_resource_check";`)
    this.addSql(`alter table if exists "pbn_checkout_error" add constraint "pbn_checkout_error_resource_check" check("resource" in ('cart', 'shipping_options', 'payment_providers', 'store_credit', 'route_render'));`)
    this.addSql(`insert into "pbn_checkout_error" ("id", "error_id", "resource", "code", "status_code", "retryable", "cart_id_hash", "region_id", "country_code", "route_key", "digest", "source", "occurred_at", "resolution_status", "admin_note", "resolved_by", "resolved_at", "created_at", "updated_at", "deleted_at") select "id", "error_id", 'route_render', "code", null, "retryable", null, null, "country_code", "route_key", "digest", "source", "occurred_at", "resolution_status", "admin_note", "resolved_by", "resolved_at", "created_at", "updated_at", "deleted_at" from "pbn_storefront_error" on conflict do nothing;`)
    this.addSql(`drop table if exists "pbn_storefront_error" cascade;`)
  }
}
