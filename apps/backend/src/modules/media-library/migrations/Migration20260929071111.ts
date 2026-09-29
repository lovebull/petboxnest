import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260929071111 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "pbn_media_asset" drop constraint if exists "pbn_media_asset_file_key_unique";`);
    this.addSql(`create table if not exists "pbn_media_asset" ("id" text not null, "file_key" text not null, "url" text not null, "filename" text not null, "mime_type" text not null, "size" integer not null, "uploaded_by" text null, "source" text check ("source" in ('admin_upload')) not null default 'admin_upload', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_media_asset_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pbn_media_asset_file_key_unique" ON "pbn_media_asset" ("file_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_media_asset_deleted_at" ON "pbn_media_asset" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_media_asset_created_at" ON "pbn_media_asset" ("created_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_media_asset_mime_created" ON "pbn_media_asset" ("mime_type", "created_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_media_asset_filename" ON "pbn_media_asset" ("filename") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "pbn_media_asset" cascade;`);
  }

}
