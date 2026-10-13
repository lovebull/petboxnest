import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20261012203319 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table if not exists "pbn_storefront_analytics_event" ("id" text not null, "event_id" text not null, "event_type" text check ("event_type" in ('page_view', 'product_view', 'add_to_cart', 'checkout_started', 'order_completed')) not null, "visitor_id" text not null, "session_id" text not null, "event_day" text not null, "occurred_at" timestamptz not null, "path" text null, "country_code" text null, "product_id" text null, "variant_id" text null, "cart_id" text null, "order_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_storefront_analytics_event_pkey" primary key ("id"));`
    )
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pbn_storefront_analytics_event_event_id_unique" ON "pbn_storefront_analytics_event" ("event_id") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pbn_storefront_analytics_event_deleted_at" ON "pbn_storefront_analytics_event" ("deleted_at") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pbn_storefront_event_session_time" ON "pbn_storefront_analytics_event" ("session_id", "occurred_at") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pbn_storefront_event_day_type" ON "pbn_storefront_analytics_event" ("event_day", "event_type") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pbn_storefront_event_visitor" ON "pbn_storefront_analytics_event" ("visitor_id", "occurred_at") WHERE deleted_at IS NULL;`
    )

    this.addSql(
      `create table if not exists "pbn_storefront_analytics_session" ("id" text not null, "session_id" text not null, "visitor_id" text not null, "session_day" text not null, "started_at" timestamptz not null, "last_seen_at" timestamptz not null, "landing_path" text null, "last_path" text null, "country_code" text null, "page_view_count" integer not null default 0, "product_view_count" integer not null default 0, "has_added_to_cart" boolean not null default false, "has_started_checkout" boolean not null default false, "has_completed_order" boolean not null default false, "is_returning_visitor" boolean not null default false, "cart_id" text null, "order_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_storefront_analytics_session_pkey" primary key ("id"));`
    )
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pbn_storefront_analytics_session_session_id_unique" ON "pbn_storefront_analytics_session" ("session_id") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pbn_storefront_analytics_session_deleted_at" ON "pbn_storefront_analytics_session" ("deleted_at") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pbn_storefront_session_day" ON "pbn_storefront_analytics_session" ("session_day", "started_at") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pbn_storefront_session_visitor" ON "pbn_storefront_analytics_session" ("visitor_id", "started_at") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pbn_storefront_session_funnel" ON "pbn_storefront_analytics_session" ("has_added_to_cart", "has_started_checkout", "has_completed_order") WHERE deleted_at IS NULL;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "pbn_storefront_analytics_event" cascade;`)
    this.addSql(`drop table if exists "pbn_storefront_analytics_session" cascade;`)
  }
}
