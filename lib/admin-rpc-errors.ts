import { NextResponse } from "next/server";
import { adminErrorResponse, safeAdminErrorLog } from "./admin-safe-errors";

const ERROR_RESPONSES: Record<string, { message: string; status: number }> = {
  ADMIN_REQUIRED: { message: "Forbidden", status: 403 },
  IDENTITY_FEATURE_DISABLED: {
    message: "Identity verification is disabled.",
    status: 409,
  },
  IDENTITY_ADMIN_REVIEW_DISABLED: {
    message: "Identity review decisions are temporarily disabled.",
    status: 409,
  },
  IDENTITY_REVIEW_NOT_FOUND: {
    message: "Verification not found.",
    status: 404,
  },
  IDENTITY_REVIEW_CONFLICT: {
    message: "Verification request has already been decided.",
    status: 409,
  },
  IDENTITY_REVIEW_INVALID: { message: "Invalid review request.", status: 400 },
  REPORT_NOT_FOUND: { message: "Report not found.", status: 404 },
  REPORT_ALREADY_TRIAGED: { message: "Report already triaged.", status: 409 },
  REPORT_ACTION_INVALID: { message: "Invalid action.", status: 400 },
  REPORT_REASON_REQUIRED: {
    message: "Reason is required for this action.",
    status: 400,
  },
  REPORT_TARGET_MISSING: {
    message: "Reported user record is unavailable.",
    status: 400,
  },
  REPORT_TARGET_PROTECTED: {
    message: "This account cannot be moderated through a report.",
    status: 403,
  },
  LISTING_NOT_FOUND: { message: "Listing not found.", status: 404 },
  LISTING_CLOSE_INVALID: {
    message: "Reason must be 3-500 characters.",
    status: 400,
  },
  LISTING_CLOSE_CONFLICT: {
    message: "Only active listings can be force-closed.",
    status: 409,
  },
  DEAL_NOT_FOUND: { message: "Deal not found.", status: 404 },
  DEAL_TERMINATE_INVALID: {
    message: "Reason must be 3-500 characters.",
    status: 400,
  },
  DEAL_TERMINATE_CONFLICT: {
    message: "Only pending or active deals can be force-terminated.",
    status: 409,
  },
};

export function adminRpcErrorResponse(
  operation: string,
  error: unknown,
  fallbackMessage: string,
): NextResponse {
  const marker = knownMarker(error);
  if (marker) {
    const mapped = ERROR_RESPONSES[marker];
    return NextResponse.json(
      { error: mapped.message, code: marker },
      { status: mapped.status },
    );
  }
  const correlationId = safeAdminErrorLog(`${operation}_rpc_failed`, error, {
    operation,
  });
  return adminErrorResponse(fallbackMessage, 500, { correlationId });
}

function knownMarker(error: unknown): string | null {
  const text = errorText(error);
  for (const marker of Object.keys(ERROR_RESPONSES)) {
    if (new RegExp(`(^|[^A-Z0-9_])${marker}([^A-Z0-9_]|$)`, "i").test(text)) {
      return marker;
    }
  }
  return null;
}

function errorText(error: unknown): string {
  if (!error || typeof error !== "object") return String(error ?? "");
  const record = error as Record<string, unknown>;
  return ["message", "details", "hint", "code"]
    .map((key) => (typeof record[key] === "string" ? record[key] : ""))
    .join(" ");
}
