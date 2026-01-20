"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { submitReportAction } from "@/actions/reports";
import IconCheckCircle from "@/icons/IconCheckCircle";
import { z } from "zod";

const REASONS = [
  { value: "spam", label: "Spam" },
  { value: "misinformation", label: "Misinformation" },
  { value: "other", label: "Other" },
] as const;

type ReportReason = (typeof REASONS)[number]["value"];

type ReportStatus = "idle" | "submitting" | "success" | "error";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaItemId: string;
  mediaItemTitle: string;
}

const DETAILS_MAX = 500;

export function ReportDialog({
  open,
  onOpenChange,
  mediaItemId,
  mediaItemTitle,
}: ReportDialogProps) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [detailsTouched, setDetailsTouched] = useState(false);
  const [reporterEmail, setReporterEmail] = useState("");
  const [status, setStatus] = useState<ReportStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [emailError, setEmailError] = useState("");

  const requiresDetails = reason === "other";
  const detailsInvalid = requiresDetails && !details.trim();
  const emailValid =
    !reporterEmail.trim() || z.email().safeParse(reporterEmail.trim()).success;

  const canSubmit =
    reason !== null && !detailsInvalid && status !== "submitting";

  function handleClose(next: boolean) {
    if (status === "submitting") return;
    onOpenChange(next);
    if (!next) {
      // Reset after close animation
      setTimeout(() => {
        setReason(null);
        setDetails("");
        setReporterEmail("");
        setStatus("idle");
        setErrorMessage("");
        setEmailError("");
        setDetailsTouched(false);
      }, 200);
    }
  }

  async function handleSubmit() {
    if (!emailValid) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setEmailError("");
    if (!canSubmit || reason === null) return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      await submitReportAction({
        mediaItemId,
        reason,
        details: details.trim(),
        reporterEmail: reporterEmail.trim(),
      });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {status === "success" ? (
          <div className="py-4 text-center space-y-3">
            <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full">
              <IconCheckCircle size={30} />
            </div>
            <DialogHeader className="items-center text-center">
              <DialogTitle>Report submitted</DialogTitle>
              <DialogDescription>
                Thank you for flagging this. Our team will review it shortly.
              </DialogDescription>
            </DialogHeader>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Report media
              </DialogTitle>
              <DialogDescription>
                Reporting:{" "}
                <span className="font-medium text-foreground">
                  {mediaItemTitle}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mb-4">
              {/* Reason */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Reason <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {REASONS.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => {
                        setReason(r.value);
                        setDetailsTouched(false);
                      }}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-md border text-sm text-left transition-colors cursor-pointer",
                        reason === r.value
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-border hover:border-muted-foreground hover:bg-muted/50",
                      )}
                    >
                      <span
                        className={cn(
                          "shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center",
                          reason === r.value
                            ? "border-red-500"
                            : "border-muted-foreground",
                        )}
                      >
                        {reason === r.value && (
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                        )}
                      </span>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Additional details{" "}
                  {requiresDetails && <span className="text-red-500">*</span>}
                  {!requiresDetails && (
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  )}
                </label>
                <textarea
                  rows={5}
                  value={details}
                  maxLength={DETAILS_MAX}
                  onBlur={() => setDetailsTouched(true)}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={
                    requiresDetails
                      ? "Please describe the issue..."
                      : "Any additional context..."
                  }
                  className={cn(
                    "w-full rounded-md border bg-background px-3 py-2 text-sm resize-none placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors",
                    detailsInvalid && detailsTouched
                      ? "border-red-500 focus:ring-red-500"
                      : "border-input",
                  )}
                />
                <div className="flex justify-between items-center">
                  {detailsInvalid && detailsTouched ? (
                    <p className="text-xs text-red-500">
                      Please describe your reason when selecting
                      &quot;Other&quot;.
                    </p>
                  ) : (
                    <span />
                  )}
                  {/* <p className="text-xs text-muted-foreground ml-auto">
                    {details.length}/{DETAILS_MAX}
                  </p> */}
                  {details.length > DETAILS_MAX * 0.8 && (
                    <p className="text-xs text-muted-foreground ml-auto">
                      {details.length}/{DETAILS_MAX}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Your email{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </label>
                <input
                  type="email"
                  value={reporterEmail}
                  onChange={(e) => {
                    setReporterEmail(e.target.value);
                    setEmailError(""); // clear error as they retype
                  }}
                  placeholder="So we can follow up if needed"
                  className={cn(
                    "w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 transition-colors",
                    emailError
                      ? "border-red-500 focus:ring-red-500"
                      : "border-input focus:ring-ring",
                  )}
                />
                {emailError && (
                  <p className="text-xs text-red-500">{emailError}</p>
                )}
              </div>

              {status === "error" && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {errorMessage}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={status === "submitting"}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="bg-red-500 hover:bg-red-600 text-white cursor-pointer"
              >
                {status === "submitting" ? "Submitting…" : "Submit report"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
