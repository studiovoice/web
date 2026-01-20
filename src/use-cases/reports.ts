import {
  createReport,
  closeReport,
  getPendingReports,
  getReportById,
  getReportsByStatus,
  getReportsForMediaItem,
} from "@/data-access/reports";
import { reports, type NewReport } from "@/db/schema";

export type SubmitReportInput = Pick<
  NewReport,
  "mediaItemId" | "reason" | "details" | "reporterEmail"
>;

// ---- USER-FACING ----

/**
 * Submit a report for a media item.
 * Validates that "other" reasons include details before persisting.
 */
export async function submitReport(input: SubmitReportInput) {
  if (input.reason === "other" && !input.details?.trim()) {
    throw new Error('Please describe your reason when selecting "Other".');
  }

  return await createReport(input);
}

// ---- ADMIN-FACING ----

/**
 * Returns all reports awaiting admin review, oldest first.
 */
export async function getPendingReportsForAdmin() {
  return await getPendingReports();
}

/**
 * Returns all reports filtered by status.
 */
export async function getReportQueueByStatus(
  status: (typeof reports.status.enumValues)[number],
) {
  return await getReportsByStatus(status);
}

/**
 * Returns all reports filed against a specific media item.
 */
export async function getReportHistoryForMediaItem(mediaItemId: string) {
  return await getReportsForMediaItem(mediaItemId);
}

/**
 * Mark a report as resolved — the content was reviewed and action was taken
 * (e.g. media item removed or moderation status updated).
 */
export async function markReportResolved(id: string, reviewNote?: string) {
  const report = await getReportById(id);
  if (!report) throw new Error(`Report ${id} not found.`);
  if (report.status !== "pending") {
    throw new Error(`Report is already ${report.status}.`);
  }

  return await closeReport(id, "resolved", reviewNote);
}

/**
 * Dismiss a report — the content was reviewed and deemed acceptable.
 */
export async function markReportDismissed(id: string, reviewNote?: string) {
  const report = await getReportById(id);
  if (!report) throw new Error(`Report ${id} not found.`);
  if (report.status !== "pending") {
    throw new Error(`Report is already ${report.status}.`);
  }

  return await closeReport(id, "dismissed", reviewNote);
}
