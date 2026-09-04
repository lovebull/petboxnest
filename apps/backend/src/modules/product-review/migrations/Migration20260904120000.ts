import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260904120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create table if not exists "pbn_product_review" ("id" text not null, "product_id" text not null, "customer_id" text not null, "order_id" text null, "order_line_item_id" text null, "rating" integer not null, "title" text null, "content" text not null, "reviewer_name" text not null, "status" text check ("status" in ('pending', 'approved', 'flagged')) not null default 'pending', "moderated_by" text null, "moderated_at" timestamptz null, "flag_reason" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_product_review_pkey" primary key ("id"), constraint "CHK_pbn_review_rating" check ("rating" between 1 and 5));`)
    this.addSql(`create unique index if not exists "IDX_pbn_review_customer_product_unique" on "pbn_product_review" ("customer_id", "product_id") where "deleted_at" is null;`)
    this.addSql(`create index if not exists "IDX_pbn_review_product_status_created" on "pbn_product_review" ("product_id", "status", "created_at") where "deleted_at" is null;`)
    this.addSql(`create index if not exists "IDX_pbn_review_status_created" on "pbn_product_review" ("status", "created_at") where "deleted_at" is null;`)
    this.addSql(`create index if not exists "IDX_pbn_review_rating_created" on "pbn_product_review" ("rating", "created_at") where "deleted_at" is null;`)
    this.addSql(`create index if not exists "IDX_pbn_review_moderated_at" on "pbn_product_review" ("moderated_at") where "deleted_at" is null;`)
    this.addSql(`create index if not exists "IDX_pbn_review_search" on "pbn_product_review" using gin (to_tsvector('english', coalesce("title", '') || ' ' || "content" || ' ' || "reviewer_name"));`)

    this.addSql(`create table if not exists "pbn_product_review_reply" ("id" text not null, "review_id" text not null, "content" text not null, "created_by" text not null, "updated_by" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_product_review_reply_pkey" primary key ("id"));`)
    this.addSql(`create unique index if not exists "IDX_pbn_review_reply_review_unique" on "pbn_product_review_reply" ("review_id") where "deleted_at" is null;`)
    this.addSql(`create index if not exists "IDX_pbn_review_reply_search" on "pbn_product_review_reply" using gin (to_tsvector('english', "content"));`)

    this.addSql(`create table if not exists "pbn_product_review_stats" ("id" text not null, "product_id" text not null, "average_rating" double precision not null default 0, "review_count" integer not null default 0, "rating_count_1" integer not null default 0, "rating_count_2" integer not null default 0, "rating_count_3" integer not null default 0, "rating_count_4" integer not null default 0, "rating_count_5" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_product_review_stats_pkey" primary key ("id"));`)
    this.addSql(`create unique index if not exists "IDX_pbn_review_stats_product_unique" on "pbn_product_review_stats" ("product_id") where "deleted_at" is null;`)

    this.addSql(`create table if not exists "pbn_product_review_audit" ("id" text not null, "review_id" text not null, "admin_user_id" text not null, "action" text check ("action" in ('approve', 'flag', 'restore_pending', 'reply_upserted', 'reply_deleted')) not null, "previous_status" text check ("previous_status" in ('pending', 'approved', 'flagged')) null, "new_status" text check ("new_status" in ('pending', 'approved', 'flagged')) null, "reason" text null, "batch_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_product_review_audit_pkey" primary key ("id"));`)
    this.addSql(`create index if not exists "IDX_pbn_review_audit_review_created" on "pbn_product_review_audit" ("review_id", "created_at") where "deleted_at" is null;`)
    this.addSql(`create index if not exists "IDX_pbn_review_audit_batch" on "pbn_product_review_audit" ("batch_id") where "deleted_at" is null;`)
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "pbn_product_review_audit" cascade;`)
    this.addSql(`drop table if exists "pbn_product_review_stats" cascade;`)
    this.addSql(`drop table if exists "pbn_product_review_reply" cascade;`)
    this.addSql(`drop table if exists "pbn_product_review" cascade;`)
  }
}
