import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "reset_password_requested_at" timestamp(3) with time zone;

    ALTER TABLE "media"
      ADD COLUMN IF NOT EXISTS "_objectkey" varchar;

    DO $$
    BEGIN
      CREATE TYPE "public"."enum_product_enhancements_image_blocks_image_source"
        AS ENUM('upload', 'external');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END
    $$;

    ALTER TABLE "product_enhancements_image_blocks"
      ADD COLUMN IF NOT EXISTS "image_source"
        "enum_product_enhancements_image_blocks_image_source"
        DEFAULT 'upload' NOT NULL,
      ADD COLUMN IF NOT EXISTS "image_url" varchar,
      ADD COLUMN IF NOT EXISTS "image_alt" varchar;

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'product_enhancements_image_blocks'
          AND column_name = 'image_source'
          AND udt_name <> 'enum_product_enhancements_image_blocks_image_source'
      ) THEN
        ALTER TABLE "product_enhancements_image_blocks"
          ALTER COLUMN "image_source" DROP DEFAULT;
        ALTER TABLE "product_enhancements_image_blocks"
          ALTER COLUMN "image_source"
          TYPE "enum_product_enhancements_image_blocks_image_source"
          USING "image_source"::text::"enum_product_enhancements_image_blocks_image_source";
        ALTER TABLE "product_enhancements_image_blocks"
          ALTER COLUMN "image_source" SET DEFAULT 'upload';
      END IF;
    END
    $$;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users"
      DROP COLUMN IF EXISTS "reset_password_requested_at";
    ALTER TABLE "media"
      DROP COLUMN IF EXISTS "_objectkey";
  `)
}
