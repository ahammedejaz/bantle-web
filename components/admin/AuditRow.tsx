"use client";

import Link from "next/link";
import { Clock, ExternalLink } from "lucide-react";
import { AuditActionBadge } from "./AuditActionBadge";
import { AuditPayloadViewer } from "./AuditPayloadViewer";

export interface AuditListItem {
  id: string;
  admin_id: string;
  action_type: string;
  target_user_id: string | null;
  target_resource_id: string | null;
  target_resource_type: string | null;
  reason: string | null;
  payload: unknown;
  created_at: string;
  admin: {
    id: string;
    display_name: string | null;
    email: string | null;
  } | null;
  target_user: {
    id: string;
    display_name: string | null;
    email: string | null;
    deleted_at: string | null;
  } | null;
}

export function AuditRow({ action }: { action: AuditListItem }) {
  const resource = getResourceLink(action);

  return (
    <article className="border border-line rounded-card bg-cream-card p-4">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <AuditActionBadge actionType={action.action_type} />
        {action.target_resource_type ? (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-button border bg-gray-50 text-gray-700 border-gray-200">
            {action.target_resource_type}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1 text-xs text-ink-muted sm:ml-auto">
          <Clock size={12} />
          {fmtTimestamp(action.created_at)}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <IdentityBlock
          label="Admin"
          primary={profileName(action.admin, "Unknown admin")}
          secondary={action.admin?.email ?? action.admin_id}
          href={action.admin?.id ? `/admin/users/${action.admin.id}` : undefined}
        />
        <IdentityBlock
          label="Target user"
          primary={targetUserName(action)}
          secondary={targetUserSecondary(action)}
          href={
            action.target_user_id
              ? `/admin/users/${action.target_user_id}`
              : undefined
          }
          muted={!action.target_user_id}
          suffix={action.target_user?.deleted_at ? "Deleted" : undefined}
        />
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-1">
            Resource
          </p>
          {resource.href ? (
            <Link
              href={resource.href}
              className="inline-flex items-center gap-1 max-w-full text-sm text-teal-700 hover:text-teal-900"
            >
              <span className="truncate">{resource.label}</span>
              <ExternalLink size={12} className="shrink-0" />
            </Link>
          ) : (
            <p className="text-sm text-ink truncate">{resource.label}</p>
          )}
          {action.target_resource_id ? (
            <p className="mt-1 text-xs text-ink-muted font-mono truncate">
              {action.target_resource_id}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 border-t border-line pt-3">
        <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-1">
          Reason
        </p>
        {action.reason ? (
          <p className="text-sm text-ink">{action.reason}</p>
        ) : (
          <p className="text-sm text-ink-muted">No reason recorded</p>
        )}
      </div>

      <AuditPayloadViewer payload={action.payload} />
    </article>
  );
}

function IdentityBlock({
  label,
  primary,
  secondary,
  href,
  muted = false,
  suffix,
}: {
  label: string;
  primary: string;
  secondary: string;
  href?: string;
  muted?: boolean;
  suffix?: string;
}) {
  const content = (
    <>
      <p className={muted ? "text-sm text-ink-muted" : "text-sm text-ink"}>
        {primary}
        {suffix ? (
          <span className="ml-2 text-xs text-red-700">{suffix}</span>
        ) : null}
      </p>
      <p className="text-xs text-ink-muted truncate">{secondary}</p>
    </>
  );

  return (
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-1">
        {label}
      </p>
      {href ? (
        <Link href={href} className="block hover:text-teal-900">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}

function getResourceLink(action: AuditListItem): {
  href?: string;
  label: string;
} {
  const type = action.target_resource_type;
  const id = action.target_resource_id;

  if (type === "user" && action.target_user_id) {
    return { href: `/admin/users/${action.target_user_id}`, label: "User" };
  }
  if (type === "listing" && id) {
    return { href: `/admin/listings/${id}`, label: "Listing" };
  }
  if (type === "deal" && id) {
    return { href: `/admin/deals/${id}`, label: "Deal" };
  }
  if (type === "user_report" && id) {
    return { href: `/admin/reports/${id}`, label: "Report" };
  }
  if (type === "platform") {
    return { href: "/admin/platforms", label: id ? `Platform ${id}` : "Platform" };
  }

  if (type || id) {
    return { label: [type ?? "Resource", id].filter(Boolean).join(" ") };
  }
  return { label: "No resource" };
}

function profileName(
  profile: AuditListItem["admin"],
  fallback: string,
): string {
  if (profile?.display_name?.trim()) return profile.display_name;
  return profile?.email ?? fallback;
}

function targetUserName(action: AuditListItem): string {
  if (!action.target_user_id) return "No target user";
  if (action.target_user?.display_name?.trim()) {
    return action.target_user.display_name;
  }
  return action.target_user?.email ?? "Unknown target user";
}

function targetUserSecondary(action: AuditListItem): string {
  if (action.target_user?.email) return action.target_user.email;
  return action.target_user_id ?? "None";
}

function fmtTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
