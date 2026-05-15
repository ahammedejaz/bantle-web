// Shared status constants and rendering helpers for user_reports
// in the admin panel. The production DB schema is:
//   status: 'pending' | 'reviewed' | 'actioned' | 'dismissed'
//   resolution_action: 'none' | 'warned' | 'banned_temp' |
//                      'banned_perm' | 'dismissed' | null
//
// 'pending' is the default for new reports — admin hasn't triaged
// yet. Actions performed by admin update both columns atomically.

export type ReportStatus =
  | "pending"
  | "reviewed"
  | "actioned"
  | "dismissed";

export type ResolutionAction =
  | "none"
  | "warned"
  | "banned_temp"
  | "banned_perm"
  | "dismissed";

export interface StatusDisplay {
  label: string;
  className: string;
}

// Status badge styling. Pending is amber (needs attention).
// Reviewed and actioned are teal (closed cleanly). Dismissed is
// red-tinted because the underlying report was bad-faith.
export function getStatusDisplay(
  status: string | null | undefined,
): StatusDisplay {
  switch (status) {
    case "pending":
      return {
        label: "Pending",
        className: "bg-amber-50 text-amber-900 border-amber-200",
      };
    case "reviewed":
      return {
        label: "Reviewed",
        className: "bg-teal-50 text-teal-900 border-teal-200",
      };
    case "actioned":
      return {
        label: "Actioned",
        className: "bg-teal-100 text-teal-900 border-teal-300",
      };
    case "dismissed":
      return {
        label: "Dismissed",
        className: "bg-red-50 text-red-900 border-red-200",
      };
    default:
      // Defensive: unknown status renders as Unknown, NOT silently
      // mapped to one of the real states. If we ever add a status,
      // this surfaces the missing case immediately.
      return {
        label: status ? `Unknown (${status})` : "Unknown",
        className: "bg-gray-50 text-gray-700 border-gray-200",
      };
  }
}

// Human label for resolution_action column values.
export function getResolutionLabel(
  action: string | null | undefined,
): string | null {
  switch (action) {
    case null:
    case undefined:
      return null;
    case "none":
      return "No action taken";
    case "warned":
      return "User warned";
    case "banned_temp":
      return "User banned 7 days";
    case "banned_perm":
      return "User banned permanently";
    case "dismissed":
      return "Report dismissed";
    default:
      return action;
  }
}

// All filter options for the list view dropdown.
export const STATUS_FILTER_OPTIONS: Array<{
  value: string;
  label: string;
}> = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "actioned", label: "Actioned" },
  { value: "dismissed", label: "Dismissed" },
];

// Valid filter values accepted by the list API. Mirrors the
// dropdown values but kept as a Set for O(1) validation.
export const VALID_STATUS_FILTERS = new Set([
  "all",
  "pending",
  "reviewed",
  "actioned",
  "dismissed",
]);

// Whether a given status is still open (needs admin attention).
// Used by the detail page to decide between rendering action
// buttons vs the "Already triaged" notice.
export function isStatusOpen(
  status: string | null | undefined,
): boolean {
  return status === "pending";
}
