"use server";

import { submitReport, type SubmitReportInput } from "@/use-cases/reports";

export async function submitReportAction(input: SubmitReportInput) {
  return await submitReport(input);
}
