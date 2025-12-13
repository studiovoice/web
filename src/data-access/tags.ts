import { database } from "@/db";
import { NewTag, tags } from "@/db/schema";
import { eq, ilike } from "drizzle-orm";

// ---- CREATE ----

export async function createTag(tag: NewTag) {
  const [created] = await database.insert(tags).values(tag).returning();
  return created;
}

export async function getOrCreateTag(name: string) {
  const existing = await getTagByName(name);
  if (existing) return existing;
  return await createTag({ name: name.trim().toLowerCase() });
}

// ---- READ ----

export async function getTagById(id: string) {
  return await database.query.tags.findFirst({
    where: eq(tags.id, id),
  });
}

export async function getTagByName(name: string) {
  return await database.query.tags.findFirst({
    where: ilike(tags.name, name.trim().toLowerCase()),
  });
}

export async function getAllTags() {
  return await database.query.tags.findMany({
    orderBy: (tags, { asc }) => [asc(tags.name)],
  });
}

export async function getTagsForMediaItem(mediaItemId: string) {
  return await database.query.mediaItemTags.findMany({
    where: (mediaItemTags, { eq }) =>
      eq(mediaItemTags.mediaItemId, mediaItemId),
    with: { tag: true },
  });
}

// ---- DELETE ----

export async function deleteTag(id: string) {
  await database.delete(tags).where(eq(tags.id, id));
}
