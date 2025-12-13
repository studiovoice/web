import {
  pgTable,
  uuid,
  text,
  doublePrecision,
  timestamp,
  pgEnum,
  primaryKey,
  index,
  bigint,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const mediaTypeEnum = pgEnum("media_type", ["image", "video"]);

export const timeOfDayEnum = pgEnum("time_of_day", [
  "morning",
  "afternoon",
  "evening",
  "night",
]);

export const processingStatusEnum = pgEnum("processing_status", [
  "pending",
  "processing",
  "done",
  "failed",
]);

export const moderationStatusEnum = pgEnum("moderation_status", [
  "pending",
  "approved",
  "rejected",
]);

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
});

export const mediaItems = pgTable(
  "media_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),

    // Storage
    objectKey: text("object_key").notNull().unique(), // Object key/path
    originalFilename: text("original_filename").notNull(),
    mimeType: text("mime_type").notNull(),
    fileSize: bigint("file_size", { mode: "number" }).notNull(), // in bytes

    // Classification
    mediaType: mediaTypeEnum("media_type").notNull(),

    // Status tracking
    processingStatus: processingStatusEnum("processing_status")
      .notNull()
      .default("pending"),
    moderationStatus: moderationStatusEnum("moderation_status")
      .notNull()
      .default("pending"),

    // Metadata
    title: text("title").notNull(),
    description: text("description"),
    // Store exif data? Either as JSONB or text

    // Geolocation
    // In the future, we might want to use PostGIS for more advanced geospatial queries
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),

    // Temporal data
    capturedAt: timestamp("captured_at", { withTimezone: true, mode: "date" }),
    timeOfDay: timeOfDayEnum("time_of_day"),
  },
  (table) => [
    index("media_items_object_key_idx").on(table.objectKey),
    index("media_items_processing_status_idx").on(table.processingStatus),
    index("media_items_coords_idx").on(table.latitude, table.longitude),
  ],
);

// Association table for many-to-many relationship
export const mediaItemTags = pgTable(
  "media_item_tags",
  {
    mediaItemId: uuid("media_item_id")
      .notNull()
      .references(() => mediaItems.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.mediaItemId, table.tagId] })],
);

// TODO: add reports table for users to report inappropriate media items
// TODO (MAYBE): add table for users to request to delete a media item
// TODO: add admin users table for managing reported media items and user requests

/**
 * RELATIONSHIPS
 *
 * Define drizzle relationships between tables
 */
export const tagsRelations = relations(tags, ({ many }) => ({
  mediaItems: many(mediaItemTags),
}));

export const mediaItemsRelations = relations(mediaItems, ({ many }) => ({
  tags: many(mediaItemTags),
}));

export const mediaItemTagsRelations = relations(mediaItemTags, ({ one }) => ({
  mediaItem: one(mediaItems, {
    fields: [mediaItemTags.mediaItemId],
    references: [mediaItems.id],
  }),
  tag: one(tags, {
    fields: [mediaItemTags.tagId],
    references: [tags.id],
  }),
}));

/**
 * TYPES
 *
 * You can create and export types from your schema to use in your application.
 * This is useful when you need to know the shape of the data you are working with
 * in a component or function.
 */
export type MediaItem = typeof mediaItems.$inferSelect;
export type NewMediaItem = typeof mediaItems.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
