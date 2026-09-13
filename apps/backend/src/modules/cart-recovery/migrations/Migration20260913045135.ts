import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260913045135 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "pbn_cart_recovery" drop constraint if exists "pbn_cart_recovery_unsubscribe_token_hash_unique";`);
    this.addSql(`alter table if exists "pbn_cart_recovery" drop constraint if exists "pbn_cart_recovery_token_hash_unique";`);
    this.addSql(`alter table if exists "pbn_cart_recovery" drop constraint if exists "pbn_cart_recovery_cart_id_unique";`);
    this.addSql(`create table if not exists "pbn_cart_recovery" ("id" text not null, "cart_id" text not null, "email" text not null, "status" text check ("status" in ('eligible', 'sent', 'recovered', 'unsubscribed', 'expired')) not null default 'eligible', "token_hash" text not null, "token_expires_at" timestamptz not null, "unsubscribe_token_hash" text not null, "consent_given" boolean not null default false, "consented_at" timestamptz not null, "consent_source" text not null, "country_code" text null, "send_count" integer not null default 0, "last_sent_at" timestamptz null, "recovered_at" timestamptz null, "unsubscribed_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_cart_recovery_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pbn_cart_recovery_cart_id_unique" ON "pbn_cart_recovery" ("cart_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pbn_cart_recovery_token_hash_unique" ON "pbn_cart_recovery" ("token_hash") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pbn_cart_recovery_unsubscribe_token_hash_unique" ON "pbn_cart_recovery" ("unsubscribe_token_hash") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_cart_recovery_deleted_at" ON "pbn_cart_recovery" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_cart_recovery_status" ON "pbn_cart_recovery" ("status", "created_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_cart_recovery_email" ON "pbn_cart_recovery" ("email") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_cart_recovery_expiry" ON "pbn_cart_recovery" ("token_expires_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "pbn_cart_recovery_log" ("id" text not null, "recovery_id" text not null, "status" text check ("status" in ('pending', 'sent', 'failed', 'recovered')) not null default 'pending', "attempt_count" integer not null default 0, "notification_id" text null, "error_message" text null, "next_retry_at" timestamptz null, "triggered_at" timestamptz not null, "sent_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_cart_recovery_log_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_cart_recovery_log_deleted_at" ON "pbn_cart_recovery_log" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_cart_recovery_log_recovery" ON "pbn_cart_recovery_log" ("recovery_id", "created_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_cart_recovery_log_retry" ON "pbn_cart_recovery_log" ("status", "next_retry_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "pbn_cart_recovery" cascade;`);

    this.addSql(`drop table if exists "pbn_cart_recovery_log" cascade;`);
  }

}
