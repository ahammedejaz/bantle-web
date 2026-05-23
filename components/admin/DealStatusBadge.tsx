import { cn } from "@/lib/utils";

export function getDealStatusDisplay(
  status: string | null | undefined,
  terminationSource?: string | null,
  terminatedAt?: string | null,
): { label: string; className: string } {
  if (terminationSource === "admin" && terminatedAt) {
    return {
      label: "Terminated by Bantle",
      className: "bg-red-50 text-red-900 border-red-200",
    };
  }

  switch (status) {
    case "pending":
      return {
        label: "Pending",
        className: "bg-amber-50 text-amber-900 border-amber-200",
      };
    case "active":
      return {
        label: "Active",
        className: "bg-teal-50 text-teal-900 border-teal-200",
      };
    case "completed":
      return {
        label: "Completed",
        className: "bg-teal-100 text-teal-900 border-teal-300",
      };
    case "disputed":
      return {
        label: "Disputed",
        className: "bg-red-50 text-red-900 border-red-200",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        className: "bg-gray-100 text-gray-700 border-gray-200",
      };
    default:
      return {
        label: status ?? "Unknown",
        className: "bg-gray-50 text-gray-700 border-gray-200",
      };
  }
}

export function DealStatusBadge({
  status,
  terminationSource,
  terminatedAt,
}: {
  status: string | null | undefined;
  terminationSource?: string | null;
  terminatedAt?: string | null;
}) {
  const display = getDealStatusDisplay(status, terminationSource, terminatedAt);
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
