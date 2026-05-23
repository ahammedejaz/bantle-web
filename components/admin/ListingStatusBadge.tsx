import { cn } from "@/lib/utils";

export function getListingStatusDisplay(status: string | null | undefined): {
  label: string;
  className: string;
} {
  if (!status) {
    return {
      label: "Unknown",
      className: "bg-gray-50 text-gray-700 border-gray-200",
    };
  }

  switch (status) {
    case "active":
      return {
        label: "Active",
        className: "bg-teal-50 text-teal-900 border-teal-200",
      };
    case "closed":
      return {
        label: "Closed",
        className: "bg-gray-100 text-gray-700 border-gray-200",
      };
    case "filled":
      return {
        label: "Filled",
        className: "bg-teal-100 text-teal-900 border-teal-300",
      };
    default:
      return {
        label: status,
        className: "bg-gray-50 text-gray-700 border-gray-200",
      };
  }
}

export function ListingStatusBadge({
  status,
}: {
  status: string | null | undefined;
}) {
  const display = getListingStatusDisplay(status);
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-button border",
        display.className,
      )}
    >
      {display.label}
    </span>
  );
}

export function ArchivedBadge({
  archivedAt,
}: {
  archivedAt: string | null | undefined;
}) {
  if (!archivedAt) return null;
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-button border bg-amber-50 text-amber-900 border-amber-200">
      Archived
    </span>
  );
}
