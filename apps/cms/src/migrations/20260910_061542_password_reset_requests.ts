import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_product_enhancements_story_sections_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_product_enhancements_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_newsletter_subscribers_status" AS ENUM('pending', 'subscribed', 'unsubscribed');
  CREATE TYPE "public"."enum_contact_submissions_status" AS ENUM('new', 'in_progress', 'resolved', 'spam');
  CREATE TYPE "public"."enum_contact_submissions_topic" AS ENUM('order_support', 'shipping_or_return', 'product_question', 'warranty_claim', 'other');
  CREATE TYPE "public"."enum_password_reset_requests_delivery_status" AS ENUM('sent', 'failed');
  CREATE TABLE "users_sessions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "created_at" timestamp(3) with time zone,
    "expires_at" timestamp(3) with time zone NOT NULL
  );

  CREATE TABLE "users" (
    "id" serial PRIMARY KEY NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "email" varchar NOT NULL,
    "reset_password_token" varchar,
    "reset_password_expiration" timestamp(3) with time zone,
    "salt" varchar,
    "hash" varchar,
    "login_attempts" numeric DEFAULT 0,
    "lock_until" timestamp(3) with time zone
  );

  CREATE TABLE "media" (
    "id" serial PRIMARY KEY NOT NULL,
    "alt" varchar NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "url" varchar,
    "thumbnail_u_r_l" varchar,
    "filename" varchar,
    "mime_type" varchar,
    "filesize" numeric,
    "width" numeric,
    "height" numeric,
    "focal_x" numeric,
    "focal_y" numeric,
    "sizes_thumbnail_url" varchar,
    "sizes_thumbnail_width" numeric,
    "sizes_thumbnail_height" numeric,
    "sizes_thumbnail_mime_type" varchar,
    "sizes_thumbnail_filesize" numeric,
    "sizes_thumbnail_filename" varchar,
    "sizes_product_story_url" varchar,
    "sizes_product_story_width" numeric,
    "sizes_product_story_height" numeric,
    "sizes_product_story_mime_type" varchar,
    "sizes_product_story_filesize" numeric,
    "sizes_product_story_filename" varchar
  );

  CREATE TABLE "online_images" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "image_url" varchar NOT NULL,
    "description" varchar,
    "alt" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "product_enhancements_highlights" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "description" varchar
  );

  CREATE TABLE "product_enhancements_story_sections" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "heading" varchar,
    "body" varchar,
    "image_id" integer,
    "image_position" "enum_product_enhancements_story_sections_image_position" DEFAULT 'left'
  );

  CREATE TABLE "product_enhancements_specifications" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar NOT NULL,
    "value" varchar NOT NULL
  );

  CREATE TABLE "product_enhancements_image_blocks" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "image_id" integer,
    "title" varchar,
    "description" varchar
  );

  CREATE TABLE "product_enhancements" (
    "id" serial PRIMARY KEY NOT NULL,
    "status" "enum_product_enhancements_status" DEFAULT 'draft' NOT NULL,
    "medusa_product_id" varchar,
    "medusa_product_handle" varchar NOT NULL,
    "title" varchar NOT NULL,
    "subtitle" varchar,
    "content" jsonb,
    "hero_eyebrow" varchar,
    "care_notes" varchar,
    "video_url" varchar,
    "seo_meta_title" varchar,
    "seo_meta_description" varchar,
    "seo_og_image_id" integer,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "articles" (
    "id" serial PRIMARY KEY NOT NULL,
    "status" "enum_articles_status" DEFAULT 'draft' NOT NULL,
    "title" varchar NOT NULL,
    "author" varchar DEFAULT 'PetBoxNest Editorial Team' NOT NULL,
    "slug" varchar NOT NULL,
    "excerpt" varchar,
    "hero_image_id" integer,
    "hero_image_url" varchar,
    "content" jsonb NOT NULL,
    "published_at" timestamp(3) with time zone,
    "seo_meta_title" varchar,
    "seo_meta_description" varchar,
    "seo_og_image_id" integer,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "articles_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "product_enhancements_id" integer
  );

  CREATE TABLE "newsletter_subscribers" (
    "id" serial PRIMARY KEY NOT NULL,
    "email" varchar NOT NULL,
    "status" "enum_newsletter_subscribers_status" DEFAULT 'pending' NOT NULL,
    "source" varchar DEFAULT 'homepage' NOT NULL,
    "consent_at" timestamp(3) with time zone NOT NULL,
    "confirmed_at" timestamp(3) with time zone,
    "unsubscribed_at" timestamp(3) with time zone,
    "confirmation_expires_at" timestamp(3) with time zone,
    "confirmation_token_hash" varchar,
    "unsubscribe_token_hash" varchar,
    "last_email_sent_at" timestamp(3) with time zone,
    "resend_message_id" varchar,
    "last_delivery_error" varchar,
    "request_fingerprint" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "contact_submissions" (
    "id" serial PRIMARY KEY NOT NULL,
    "status" "enum_contact_submissions_status" DEFAULT 'new' NOT NULL,
    "name" varchar NOT NULL,
    "email" varchar NOT NULL,
    "topic" "enum_contact_submissions_topic" NOT NULL,
    "order_number" varchar,
    "message" varchar NOT NULL,
    "admin_notes" varchar,
    "source" varchar DEFAULT 'storefront-contact' NOT NULL,
    "country_code" varchar,
    "request_fingerprint" varchar,
    "user_agent" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "password_reset_requests" (
    "id" serial PRIMARY KEY NOT NULL,
    "request_id" varchar NOT NULL,
    "username" varchar NOT NULL,
    "requested_at" timestamp(3) with time zone NOT NULL,
    "ip_address" varchar NOT NULL,
    "browser_fingerprint" varchar NOT NULL,
    "fingerprint_hash" varchar NOT NULL,
    "user_agent" varchar,
    "delivery_status" "enum_password_reset_requests_delivery_status" DEFAULT 'sent' NOT NULL,
    "resend_message_id" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_kv" (
    "id" serial PRIMARY KEY NOT NULL,
    "key" varchar NOT NULL,
    "data" jsonb NOT NULL
  );

  CREATE TABLE "payload_locked_documents" (
    "id" serial PRIMARY KEY NOT NULL,
    "global_slug" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_locked_documents_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "users_id" integer,
    "media_id" integer,
    "online_images_id" integer,
    "product_enhancements_id" integer,
    "articles_id" integer,
    "newsletter_subscribers_id" integer,
    "contact_submissions_id" integer,
    "password_reset_requests_id" integer
  );

  CREATE TABLE "payload_preferences" (
    "id" serial PRIMARY KEY NOT NULL,
    "key" varchar,
    "value" jsonb,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_preferences_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "users_id" integer
  );

  CREATE TABLE "payload_migrations" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar,
    "batch" numeric,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_enhancements_highlights" ADD CONSTRAINT "product_enhancements_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_enhancements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_enhancements_story_sections" ADD CONSTRAINT "product_enhancements_story_sections_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_enhancements_story_sections" ADD CONSTRAINT "product_enhancements_story_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_enhancements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_enhancements_specifications" ADD CONSTRAINT "product_enhancements_specifications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_enhancements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_enhancements_image_blocks" ADD CONSTRAINT "product_enhancements_image_blocks_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_enhancements_image_blocks" ADD CONSTRAINT "product_enhancements_image_blocks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."product_enhancements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_enhancements" ADD CONSTRAINT "product_enhancements_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_product_enhancements_fk" FOREIGN KEY ("product_enhancements_id") REFERENCES "public"."product_enhancements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_online_images_fk" FOREIGN KEY ("online_images_id") REFERENCES "public"."online_images"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_product_enhancements_fk" FOREIGN KEY ("product_enhancements_id") REFERENCES "public"."product_enhancements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_newsletter_subscribers_fk" FOREIGN KEY ("newsletter_subscribers_id") REFERENCES "public"."newsletter_subscribers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_submissions_fk" FOREIGN KEY ("contact_submissions_id") REFERENCES "public"."contact_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_password_reset_requests_fk" FOREIGN KEY ("password_reset_requests_id") REFERENCES "public"."password_reset_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_product_story_sizes_product_story_filename_idx" ON "media" USING btree ("sizes_product_story_filename");
  CREATE INDEX "online_images_updated_at_idx" ON "online_images" USING btree ("updated_at");
  CREATE INDEX "online_images_created_at_idx" ON "online_images" USING btree ("created_at");
  CREATE INDEX "product_enhancements_highlights_order_idx" ON "product_enhancements_highlights" USING btree ("_order");
  CREATE INDEX "product_enhancements_highlights_parent_id_idx" ON "product_enhancements_highlights" USING btree ("_parent_id");
  CREATE INDEX "product_enhancements_story_sections_order_idx" ON "product_enhancements_story_sections" USING btree ("_order");
  CREATE INDEX "product_enhancements_story_sections_parent_id_idx" ON "product_enhancements_story_sections" USING btree ("_parent_id");
  CREATE INDEX "product_enhancements_story_sections_image_idx" ON "product_enhancements_story_sections" USING btree ("image_id");
  CREATE INDEX "product_enhancements_specifications_order_idx" ON "product_enhancements_specifications" USING btree ("_order");
  CREATE INDEX "product_enhancements_specifications_parent_id_idx" ON "product_enhancements_specifications" USING btree ("_parent_id");
  CREATE INDEX "product_enhancements_image_blocks_order_idx" ON "product_enhancements_image_blocks" USING btree ("_order");
  CREATE INDEX "product_enhancements_image_blocks_parent_id_idx" ON "product_enhancements_image_blocks" USING btree ("_parent_id");
  CREATE INDEX "product_enhancements_image_blocks_image_idx" ON "product_enhancements_image_blocks" USING btree ("image_id");
  CREATE UNIQUE INDEX "product_enhancements_medusa_product_id_idx" ON "product_enhancements" USING btree ("medusa_product_id");
  CREATE UNIQUE INDEX "product_enhancements_medusa_product_handle_idx" ON "product_enhancements" USING btree ("medusa_product_handle");
  CREATE INDEX "product_enhancements_seo_seo_og_image_idx" ON "product_enhancements" USING btree ("seo_og_image_id");
  CREATE INDEX "product_enhancements_updated_at_idx" ON "product_enhancements" USING btree ("updated_at");
  CREATE INDEX "product_enhancements_created_at_idx" ON "product_enhancements" USING btree ("created_at");
  CREATE UNIQUE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
  CREATE INDEX "articles_hero_image_idx" ON "articles" USING btree ("hero_image_id");
  CREATE INDEX "articles_seo_seo_og_image_idx" ON "articles" USING btree ("seo_og_image_id");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE INDEX "articles_rels_order_idx" ON "articles_rels" USING btree ("order");
  CREATE INDEX "articles_rels_parent_idx" ON "articles_rels" USING btree ("parent_id");
  CREATE INDEX "articles_rels_path_idx" ON "articles_rels" USING btree ("path");
  CREATE INDEX "articles_rels_product_enhancements_id_idx" ON "articles_rels" USING btree ("product_enhancements_id");
  CREATE UNIQUE INDEX "newsletter_subscribers_email_idx" ON "newsletter_subscribers" USING btree ("email");
  CREATE INDEX "newsletter_subscribers_status_idx" ON "newsletter_subscribers" USING btree ("status");
  CREATE INDEX "newsletter_subscribers_confirmation_token_hash_idx" ON "newsletter_subscribers" USING btree ("confirmation_token_hash");
  CREATE INDEX "newsletter_subscribers_unsubscribe_token_hash_idx" ON "newsletter_subscribers" USING btree ("unsubscribe_token_hash");
  CREATE INDEX "newsletter_subscribers_updated_at_idx" ON "newsletter_subscribers" USING btree ("updated_at");
  CREATE INDEX "newsletter_subscribers_created_at_idx" ON "newsletter_subscribers" USING btree ("created_at");
  CREATE INDEX "contact_submissions_status_idx" ON "contact_submissions" USING btree ("status");
  CREATE INDEX "contact_submissions_name_idx" ON "contact_submissions" USING btree ("name");
  CREATE INDEX "contact_submissions_email_idx" ON "contact_submissions" USING btree ("email");
  CREATE INDEX "contact_submissions_topic_idx" ON "contact_submissions" USING btree ("topic");
  CREATE INDEX "contact_submissions_order_number_idx" ON "contact_submissions" USING btree ("order_number");
  CREATE INDEX "contact_submissions_source_idx" ON "contact_submissions" USING btree ("source");
  CREATE INDEX "contact_submissions_country_code_idx" ON "contact_submissions" USING btree ("country_code");
  CREATE INDEX "contact_submissions_updated_at_idx" ON "contact_submissions" USING btree ("updated_at");
  CREATE INDEX "contact_submissions_created_at_idx" ON "contact_submissions" USING btree ("created_at");
  CREATE UNIQUE INDEX "password_reset_requests_request_id_idx" ON "password_reset_requests" USING btree ("request_id");
  CREATE INDEX "password_reset_requests_username_idx" ON "password_reset_requests" USING btree ("username");
  CREATE INDEX "password_reset_requests_requested_at_idx" ON "password_reset_requests" USING btree ("requested_at");
  CREATE INDEX "password_reset_requests_ip_address_idx" ON "password_reset_requests" USING btree ("ip_address");
  CREATE INDEX "password_reset_requests_fingerprint_hash_idx" ON "password_reset_requests" USING btree ("fingerprint_hash");
  CREATE INDEX "password_reset_requests_delivery_status_idx" ON "password_reset_requests" USING btree ("delivery_status");
  CREATE INDEX "password_reset_requests_resend_message_id_idx" ON "password_reset_requests" USING btree ("resend_message_id");
  CREATE INDEX "password_reset_requests_updated_at_idx" ON "password_reset_requests" USING btree ("updated_at");
  CREATE INDEX "password_reset_requests_created_at_idx" ON "password_reset_requests" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_online_images_id_idx" ON "payload_locked_documents_rels" USING btree ("online_images_id");
  CREATE INDEX "payload_locked_documents_rels_product_enhancements_id_idx" ON "payload_locked_documents_rels" USING btree ("product_enhancements_id");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_newsletter_subscribers_id_idx" ON "payload_locked_documents_rels" USING btree ("newsletter_subscribers_id");
  CREATE INDEX "payload_locked_documents_rels_contact_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_submissions_id");
  CREATE INDEX "payload_locked_documents_rels_password_reset_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("password_reset_requests_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "online_images" CASCADE;
  DROP TABLE "product_enhancements_highlights" CASCADE;
  DROP TABLE "product_enhancements_story_sections" CASCADE;
  DROP TABLE "product_enhancements_specifications" CASCADE;
  DROP TABLE "product_enhancements_image_blocks" CASCADE;
  DROP TABLE "product_enhancements" CASCADE;
  DROP TABLE "articles" CASCADE;
  DROP TABLE "articles_rels" CASCADE;
  DROP TABLE "newsletter_subscribers" CASCADE;
  DROP TABLE "contact_submissions" CASCADE;
  DROP TABLE "password_reset_requests" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_product_enhancements_story_sections_image_position";
  DROP TYPE "public"."enum_product_enhancements_status";
  DROP TYPE "public"."enum_articles_status";
  DROP TYPE "public"."enum_newsletter_subscribers_status";
  DROP TYPE "public"."enum_contact_submissions_status";
  DROP TYPE "public"."enum_contact_submissions_topic";
  DROP TYPE "public"."enum_password_reset_requests_delivery_status";`)
}
