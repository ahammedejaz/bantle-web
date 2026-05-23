import { cn } from "@/lib/utils";

export function formatAuditAction(type: string): string {
  return type
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function AuditActionBadge({ actionType }: { actionType: string }) {
  const className = getAuditActionClass(actionType);

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-button border",
        className,
      )}
    >
      {formatAuditAction(actionType)}
    </span>
  );
}

function getAuditActionClass(actionType: string): string {
  if (actionType.startsWith("user_")) {
    return "bg-amber-50 text-amber-900 border-amber-200";
  }
  if (actionType.startsWith("platform_")) {
    return "bg-teal-50 text-teal-900 border-teal-200";
  }
  if (actionType.startsWith("listing_")) {
    return "bg-blue-50 text-blue-900 border-blue-200";
  }
  if (actionType.startsWith("deal_")) {
    return "bg-red-50 text-red-900 border-red-200";
  }
  if (actionType.startsWith("report_")) {
    return "bg-purple-50 text-purple-900 border-purple-200";
  }
  return "bg-gray-50 text-gray-700 border-gray-200";
}
