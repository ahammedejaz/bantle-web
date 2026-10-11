// Shared status badge + date helpers for the platform-request queue, so the
// list and detail views cannot drift apart on labels or tone.

export type PlatformRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export function getRequestStatusDisplay(status: PlatformRequestStatus): {
  label: string;
  className: string;
} {
  if (status === "approved") {
    return {
      label: "Approved",
      className: "bg-teal-50 text-teal-900 border-teal-200",
    };
  }
  if (status === "rejected") {
    return {
      label: "Rejected",
      className: "bg-red-50 text-red-900 border-red-200",
    };
  }
  if (status === "cancelled") {
    return {
      label: "Cancelled",
      className: "bg-gray-50 text-gray-700 border-gray-200",
    };
  }
  return {
    label: "Pending",
    className: "bg-amber-50 text-amber-900 border-amber-200",
  };
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// "Disney+ Hotstar" -> "disney_hotstar". Mirrors suggestSlug() in
// PlatformEditorDialog so both entry points propose the same slug.
export function suggestSlug(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}

// Initials for the brand tile: first letter of each of the first two words.
export function suggestInitials(label: string): string {
  const words = label
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .slice(0, 2);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words.map((word) => word[0]).join("").toUpperCase();
}
