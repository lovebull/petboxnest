import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260913045050 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "pbn_restock_subscription" drop constraint if exists "pbn_restock_subscription_unsubscribe_token_hash_unique";`);
    this.addSql(`alter table if exists "pbn_restock_subscription" drop constraint if exists "pbn_restock_subscription_subscription_key_unique";`);
    this.addSql(`create table if not exists "pbn_restock_notification_log" ("id" text not null, "subscription_id" text not null, "status" text check ("status" in ('pending', 'sent', 'failed')) not null default 'pending', "attempt_count" integer not null default 0, "notification_id" text null, "error_message" text null, "next_retry_at" timestamptz null, "triggered_at" timestamptz not null, "sent_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_restock_notification_log_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_restock_notification_log_deleted_at" ON "pbn_restock_notification_log" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_restock_log_subscription" ON "pbn_restock_notification_log" ("subscription_id", "created_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_restock_log_retry" ON "pbn_restock_notification_log" ("status", "next_retry_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "pbn_restock_subscription" ("id" text not null, "subscription_key" text not null, "variant_id" text not null, "sales_channel_id" text not null, "email" text not null, "customer_id" text null, "country_code" text null, "status" text check ("status" in ('active', 'notified', 'unsubscribed')) not null default 'active', "consent_given" boolean not null default false, "consented_at" timestamptz not null, "consent_source" text not null, "unsubscribe_token_hash" text not null, "last_notified_at" timestamptz null, "unsubscribed_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_restock_subscription_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pbn_restock_subscription_subscription_key_unique" ON "pbn_restock_subscription" ("subscription_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pbn_restock_subscription_unsubscribe_token_hash_unique" ON "pbn_restock_subscription" ("unsubscribe_token_hash") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_restock_subscription_deleted_at" ON "pbn_restock_subscription" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_restock_status_created" ON "pbn_restock_subscription" ("status", "created_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_restock_variant_status" ON "pbn_restock_subscription" ("variant_id", "status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_restock_email" ON "pbn_restock_subscription" ("email") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "pbn_restock_notification_log" cascade;`);

    this.addSql(`drop table if exists "pbn_restock_subscription" cascade;`);
  }

}
