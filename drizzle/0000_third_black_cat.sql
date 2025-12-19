CREATE TYPE "public"."media_type" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TYPE "public"."moderation_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."processing_status" AS ENUM('pending', 'processing', 'done', 'failed');--> statement-breakpoint
CREATE TYPE "public"."time_of_day" AS ENUM('morning', 'afternoon', 'evening', 'night');--> statement-breakpoint
CREATE TABLE "media_item_tags" (
	"media_item_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "media_item_tags_media_item_id_tag_id_pk" PRIMARY KEY("media_item_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "media_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"object_key" text NOT NULL,
	"original_filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size" bigint NOT NULL,
	"media_type" "media_type" NOT NULL,
	"processing_status" "processing_status" DEFAULT 'pending' NOT NULL,
	"moderation_status" "moderation_status" DEFAULT 'pending' NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"captured_at" timestamp with time zone,
	"time_of_day" time_of_day,
	CONSTRAINT "media_items_object_key_unique" UNIQUE("object_key")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "media_item_tags" ADD CONSTRAINT "media_item_tags_media_item_id_media_items_id_fk" FOREIGN KEY ("media_item_id") REFERENCES "public"."media_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_item_tags" ADD CONSTRAINT "media_item_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "media_items_object_key_idx" ON "media_items" USING btree ("object_key");--> statement-breakpoint
CREATE INDEX "media_items_processing_status_idx" ON "media_items" USING btree ("processing_status");--> statement-breakpoint
CREATE INDEX "media_items_coords_idx" ON "media_items" USING btree ("latitude","longitude");