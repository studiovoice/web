import { database } from "@/db";
import {
  MediaItem,
  NewMediaItem,
  mediaItems,
  mediaItemTags,
} from "@/db/schema";
import { and, eq, ilike, inArray, sql, between } from "drizzle-orm";

// ---- CREATE ----

export async function createMediaItem(item: NewMediaItem) {
  const [created] = await database.insert(mediaItems).values(item).returning();
  return created;
}

export async function attachTagToMediaItem(mediaItemId: string, tagId: string) {
  await database
    .insert(mediaItemTags)
    .values({ mediaItemId, tagId })
    .onConflictDoNothing();
}

export async function detachTagFromMediaItem(
  mediaItemId: string,
  tagId: string,
) {
  await database
    .delete(mediaItemTags)
    .where(
      and(
        eq(mediaItemTags.mediaItemId, mediaItemId),
        eq(mediaItemTags.tagId, tagId),
      ),
    );
}

// ---- READ ----

export async function getMediaItemById(id: string) {
  return await database.query.mediaItems.findFirst({
    where: eq(mediaItems.id, id),
    with: { tags: { with: { tag: true } } },
  });
}

// Get media items with pagination (not needed for map view, but maybe useful for admin panel or list view)
export async function getMediaItems(page: number, pageSize = 20) {
  const offset = (page - 1) * pageSize;

  const items = await database.query.mediaItems.findMany({
    where: eq(mediaItems.moderationStatus, "approved"),
    with: { tags: { with: { tag: true } } },
    limit: pageSize,
    offset,
    orderBy: (mediaItems, { desc }) => [desc(mediaItems.createdAt)],
  });

  const [{ total }] = await database
    .select({ total: sql`count(*)`.mapWith(Number).as("total") })
    .from(mediaItems)
    .where(eq(mediaItems.moderationStatus, "approved"));

  return { data: items, total, perPage: pageSize };
}

export async function getMediaItemsByBounds(bounds: {
  north: number;
  south: number;
  east: number;
  west: number;
}) {
  return await database.query.mediaItems.findMany({
    where: and(
      eq(mediaItems.moderationStatus, "approved"), // only show approved items on the map
      between(mediaItems.latitude, bounds.south, bounds.north),
      between(mediaItems.longitude, bounds.west, bounds.east),
    ),
    with: { tags: { with: { tag: true } } },
    orderBy: (mediaItems, { desc }) => [desc(mediaItems.createdAt)], // newest first
  });
}

export async function getMediaItemsByTag(
  tagId: string,
  page: number,
  pageSize = 20,
) {
  const offset = (page - 1) * pageSize;

  // Get all mediaItem IDs that have this tag
  const taggedItemIds = await database
    .select({ mediaItemId: mediaItemTags.mediaItemId })
    .from(mediaItemTags)
    .where(eq(mediaItemTags.tagId, tagId));

  const ids = taggedItemIds.map((r) => r.mediaItemId);

  if (ids.length === 0) return { data: [], total: 0, perPage: pageSize };

  const items = await database.query.mediaItems.findMany({
    where: and(
      inArray(mediaItems.id, ids),
      eq(mediaItems.moderationStatus, "approved"),
    ),
    with: { tags: { with: { tag: true } } },
    limit: pageSize,
    offset,
    orderBy: (mediaItems, { desc }) => [desc(mediaItems.createdAt)],
  });

  const [{ total }] = await database
    .select({ total: sql`count(*)`.mapWith(Number).as("total") })
    .from(mediaItems)
    .where(
      and(
        inArray(mediaItems.id, ids),
        eq(mediaItems.moderationStatus, "approved"),
      ),
    );

  return { data: items, total, perPage: pageSize };
}

export async function searchMediaItemsByTitle(
  search: string,
  page: number,
  pageSize = 20,
) {
  const offset = (page - 1) * pageSize;
  const condition = and(
    eq(mediaItems.moderationStatus, "approved"),
    search ? ilike(mediaItems.title, `%${search}%`) : undefined,
  );

  const items = await database.query.mediaItems.findMany({
    where: condition,
    with: { tags: { with: { tag: true } } },
    limit: pageSize,
    offset,
    orderBy: (mediaItems, { desc }) => [desc(mediaItems.createdAt)],
  });

  const [{ total }] = await database
    .select({ total: sql`count(*)`.mapWith(Number).as("total") })
    .from(mediaItems)
    .where(condition);

  return { data: items, total, perPage: pageSize };
}

export async function getMediaItemsByProcessingStatus(
  status: MediaItem["processingStatus"],
) {
  return await database.query.mediaItems.findMany({
    where: eq(mediaItems.processingStatus, status),
    with: { tags: { with: { tag: true } } },
    orderBy: (mediaItems, { asc }) => [asc(mediaItems.createdAt)],
  });
}

export async function getMediaItemsByModerationStatus(
  status: MediaItem["moderationStatus"],
) {
  return await database.query.mediaItems.findMany({
    where: eq(mediaItems.moderationStatus, status),
    with: { tags: { with: { tag: true } } },
    orderBy: (mediaItems, { asc }) => [asc(mediaItems.createdAt)],
  });
}

// ---- UPDATE ----

export async function updateMediaItem(id: string, data: Partial<MediaItem>) {
  const [updated] = await database
    .update(mediaItems)
    .set(data)
    .where(eq(mediaItems.id, id))
    .returning();
  return updated;
}

export async function updateProcessingStatus(
  id: string,
  status: MediaItem["processingStatus"],
) {
  await database
    .update(mediaItems)
    .set({ processingStatus: status })
    .where(eq(mediaItems.id, id));
}

export async function updateModerationStatus(
  id: string,
  status: MediaItem["moderationStatus"],
) {
  await database
    .update(mediaItems)
    .set({ moderationStatus: status })
    .where(eq(mediaItems.id, id));
}

// ---- DELETE ----

export async function deleteMediaItem(id: string) {
  await database.delete(mediaItems).where(eq(mediaItems.id, id));
}

export async function deleteAllTagsFromMediaItem(mediaItemId: string) {
  await database
    .delete(mediaItemTags)
    .where(eq(mediaItemTags.mediaItemId, mediaItemId));
}
