import { MediaItem, NewMediaItem } from "@/db/schema";
import {
  attachTagToMediaItem,
  createMediaItem,
  deleteAllTagsFromMediaItem,
  deleteMediaItem,
  getMediaItemById,
  getMediaItemsByBounds,
  // getMediaItems,
  // getMediaItemsByModerationStatus,
  // getMediaItemsByProcessingStatus,
  getMediaItemsByTag,
  searchMediaItemsByTitle,
  updateMediaItem,
  updateModerationStatus,
  updateProcessingStatus,
} from "@/data-access/media-items";
import {
  deleteTag,
  getAllTags,
  getOrCreateTag,
  getTagById,
} from "@/data-access/tags";
import { PublicError } from "@/use-cases/errors";

// ---- HELPERS ----

function deriveTimeOfDay(date: Date): MediaItem["timeOfDay"] {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

function validateCoordinates(latitude: number, longitude: number) {
  if (latitude < -90 || latitude > 90) {
    throw new PublicError("Latitude must be between -90 and 90");
  }
  if (longitude < -180 || longitude > 180) {
    throw new PublicError("Longitude must be between -180 and 180");
  }
}

// ---- CREATE ----

export async function createMediaItemUseCase(
  data: NewMediaItem,
  tagNames: string[] = [],
) {
  validateCoordinates(data.latitude, data.longitude);

  // Derive timeOfDay from capturedAt if not provided
  if (data.capturedAt && !data.timeOfDay) {
    data.timeOfDay = deriveTimeOfDay(new Date(data.capturedAt));
  }

  const mediaItem = await createMediaItem(data);

  // Attach tags, creating any that don't exist yet
  for (const name of tagNames) {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) continue;
    const tag = await getOrCreateTag(trimmed);
    await attachTagToMediaItem(mediaItem.id, tag.id);
  }

  return mediaItem;
}

// ---- READ ----

export async function getMediaItemByIdUseCase(id: string) {
  const item = await getMediaItemById(id);
  if (!item) throw new PublicError("Media item not found");

  // Don't expose items that are pending moderation
  if (
    item.moderationStatus === "pending" ||
    item.moderationStatus === "rejected"
  ) {
    throw new PublicError("Media item not available");
  }

  return item;
}

// Not needed for map view, but maybe useful for admin panel or list view
// export async function getMediaItemsUseCase(page: number, pageSize = 20) {
//   return await getMediaItems(page, pageSize);
// }

export async function getMediaItemsByBoundsUseCase(bounds: {
  north: number;
  south: number;
  east: number;
  west: number;
}) {
  // Validate bounds are real coordinates
  if (bounds.north < bounds.south) {
    throw new PublicError("Invalid bounds: north must be greater than south");
  }
  if (bounds.east < bounds.west) {
    throw new PublicError("Invalid bounds: east must be greater than west");
  }

  validateCoordinates(bounds.north, bounds.east);
  validateCoordinates(bounds.south, bounds.west);

  return await getMediaItemsByBounds(bounds);
}

export async function getMediaItemsByTagUseCase(
  tagId: string,
  page: number,
  pageSize = 20,
) {
  const tag = await getTagById(tagId);
  if (!tag) throw new PublicError("Tag not found");

  return await getMediaItemsByTag(tagId, page, pageSize);
}

export async function searchMediaItemsUseCase(search: string, page: number) {
  return await searchMediaItemsByTitle(search, page);
}

export async function getAllTagsUseCase() {
  return await getAllTags();
}

// ---- UPDATE ----

export async function updateMediaItemUseCase(
  id: string,
  data: Partial<MediaItem>,
  tagNames?: string[],
) {
  const existing = await getMediaItemById(id);
  if (!existing) throw new PublicError("Media item not found");

  if (existing.processingStatus === "processing") {
    throw new PublicError(
      "Cannot update a media item while it is being processed",
    );
  }

  if (data.latitude !== undefined || data.longitude !== undefined) {
    validateCoordinates(
      data.latitude ?? existing.latitude,
      data.longitude ?? existing.longitude,
    );
  }

  // If capturedAt changes, re-derive timeOfDay unless explicitly provided
  if (data.capturedAt && !data.timeOfDay) {
    data.timeOfDay = deriveTimeOfDay(new Date(data.capturedAt));
  }

  const updated = await updateMediaItem(id, data);

  // If tagNames provided, replace all tags
  if (tagNames !== undefined) {
    await deleteAllTagsFromMediaItem(id);
    for (const name of tagNames) {
      const trimmed = name.trim().toLowerCase();
      if (!trimmed) continue;
      const tag = await getOrCreateTag(trimmed);
      await attachTagToMediaItem(id, tag.id);
    }
  }

  return updated;
}

export async function updateProcessingStatusUseCase(
  id: string,
  status: MediaItem["processingStatus"],
) {
  const existing = await getMediaItemById(id);
  if (!existing) throw new PublicError("Media item not found");

  // Guard against invalid status transitions
  if (existing.processingStatus === "done" && status === "pending") {
    throw new PublicError(
      "Cannot revert a completed media item back to pending",
    );
  }

  await updateProcessingStatus(id, status);
}

export async function updateModerationStatusUseCase(
  id: string,
  status: MediaItem["moderationStatus"],
) {
  const existing = await getMediaItemById(id);
  if (!existing) throw new PublicError("Media item not found");
  await updateModerationStatus(id, status);
}

// ---- DELETE ----

export async function deleteMediaItemUseCase(id: string) {
  const existing = await getMediaItemById(id);
  if (!existing) throw new PublicError("Media item not found");

  if (existing.processingStatus === "processing") {
    throw new PublicError(
      "Cannot delete a media item while it is being processed",
    );
  }

  // Tags in mediaItemTags will cascade delete if FK cascade is set,
  // otherwise we clean them up manually first
  await deleteAllTagsFromMediaItem(id);
  await deleteMediaItem(id);
}

export async function deleteTagUseCase(id: string) {
  const existing = await getTagById(id);
  if (!existing) throw new PublicError("Tag not found");

  // This will also remove all mediaItemTags rows referencing this tag
  // because of the FK reference — or handle manually if no cascade
  await deleteTag(id);
}
