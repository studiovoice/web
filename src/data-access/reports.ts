import { database } from "@/db";
import { type NewReport, reports } from "@/db/schema";
import { eq } from "drizzle-orm";

// ---- CREATE ----

export async function createReport(report: NewReport) {
  const [created] = await database.insert(reports).values(report).returning();
  return created;
}

// ---- READ ----

export async function getReportById(id: string) {
  return await database.query.reports.findFirst({
    where: eq(reports.id, id),
    with: { mediaItem: true },
  });
}

export async function getReportsForMediaItem(mediaItemId: string) {
  return await database.query.reports.findMany({
    where: eq(reports.mediaItemId, mediaItemId),
    orderBy: (reports, { desc }) => [desc(reports.createdAt)],
  });
}

export async function getPendingReports() {
  return await database.query.reports.findMany({
    where: eq(reports.status, "pending"),
    with: { mediaItem: true },
    orderBy: (reports, { asc }) => [asc(reports.createdAt)],
  });
}

export async function getReportsByStatus(
  status: (typeof reports.status.enumValues)[number],
) {
  return await database.query.reports.findMany({
    where: eq(reports.status, status),
    with: { mediaItem: true },
    orderBy: (reports, { desc }) => [desc(reports.createdAt)],
  });
}

// ---- UPDATE (admin review) ----

export async function closeReport(
  id: string,
  status: "resolved" | "dismissed",
  adminNote?: string,
) {
  const [updated] = await database
    .update(reports)
    .set({ status, adminNote, closedAt: new Date() })
    .where(eq(reports.id, id))
    .returning();
  return updated;
}

// ---- DELETE ----

export async function deleteReport(id: string) {
  await database.delete(reports).where(eq(reports.id, id));
}

export async function deleteReportsForMediaItem(mediaItemId: string) {
  await database.delete(reports).where(eq(reports.mediaItemId, mediaItemId));
}
