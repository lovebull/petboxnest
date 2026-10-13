import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261013152157 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table if exists "pbn_order_milestone" drop constraint if exists "pbn_order_milestone_threshold_unique";`,
    );
    this.addSql(
      `create table if not exists "pbn_order_milestone" ("id" text not null, "threshold" integer not null, "achieved_order_count" integer not null, "achieved_at" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_order_milestone_pkey" primary key ("id"));`,
    );
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pbn_order_milestone_threshold_unique" ON "pbn_order_milestone" ("threshold") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pbn_order_milestone_deleted_at" ON "pbn_order_milestone" ("deleted_at") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pbn_order_milestone_achieved_at" ON "pbn_order_milestone" ("achieved_at") WHERE deleted_at IS NULL;`,
    );

    this.addSql(
      `create table if not exists "pbn_order_milestone_acknowledgement" ("id" text not null, "milestone_id" text not null, "admin_user_id" text not null, "dismissed_at" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_order_milestone_acknowledgement_pkey" primary key ("id"));`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pbn_order_milestone_acknowledgement_deleted_at" ON "pbn_order_milestone_acknowledgement" ("deleted_at") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_pbn_order_milestone_ack_admin" ON "pbn_order_milestone_acknowledgement" ("milestone_id", "admin_user_id") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pbn_order_milestone_ack_admin_time" ON "pbn_order_milestone_acknowledgement" ("admin_user_id", "dismissed_at") WHERE deleted_at IS NULL;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "pbn_order_milestone" cascade;`);

    this.addSql(
      `drop table if exists "pbn_order_milestone_acknowledgement" cascade;`,
    );
  }
}
