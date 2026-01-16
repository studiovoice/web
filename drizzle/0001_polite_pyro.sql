CREATE TYPE "public"."report_reason" AS ENUM('spam', 'misinformation', 'other');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('pending', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"media_item_id" uuid NOT NULL,
	"reporter_email" text,
	"reason" "report_reason" NOT NULL,
	"details" text,
	"status" "report_status" DEFAULT 'pending' NOT NULL,
	"admin_note" text,
	"closed_at" timestamp with time zone,
	CONSTRAINT "reports_media_item_reporter_email_unique" UNIQUE("media_item_id","reporter_email")
);
--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_media_item_id_media_items_id_fk" FOREIGN KEY ("media_item_id") REFERENCES "public"."media_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reports_media_item_id_idx" ON "reports" USING btree ("media_item_id");--> statement-breakpoint
CREATE INDEX "reports_status_idx" ON "reports" USING btree ("status");