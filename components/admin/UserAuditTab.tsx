"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useAdminToast } from "./AdminToastProvider";

interface AuditAction {
  id: string;
  action_type: string;
  target_resource_id: string | null;
  target_resource_type: string | null;
  reason: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
  admin: { display_name: string | null } | null;
}

function formatActionType(type: string): string {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function fmtTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AuditRow({ action }: { action: AuditAction }) {
  const [open, setOpen] = useState(false);
  const adminName =
    action.admin?.display_name && action.admin.display_name.trim()
      ? action.admin.display_name
      : "Unnamed admin";
  const hasPayload =
    action.payload && Object.keys(action.payload).length > 0;

  return (
    <li className="px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-ink">
            <span className="font-medium">{formatActionType(action.action_type)}</span>{" "}
            <span className="text-ink-muted">by {adminName}</span>
          </p>
          {action.reason ? (
            <p className="text-xs text-ink-muted mt-1 italic">
              &ldquo;{action.reason}&rdquo;
            </p>
          ) : null}
        </div>
        <span className="text-xs text-ink-muted shrink-0">
          {fmtTimestamp(action.created_at)}
        </span>
      </div>
      {hasPayload ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="mt-2 inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-900"
        >
          {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          {open ? "Hide payload" : "Show payload"}
        </button>
      ) : null}
      {open && hasPayload ? (
        <pre className="mt-2 bg-cream rounded-button border border-line p-2 text-[11px] text-ink-muted overflow-x-auto">
          {JSON.stringify(action.payload, null, 2)}
        </pre>
      ) : null}
    </li>
  );
}

export function UserAuditTab({ userId }: { userId: string }) {
  const toast = useAdminToast();
  const [actions, setActions] = useState<AuditAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/admin/api/users/${userId}/audit`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { actions: AuditAction[] };
        if (cancelled) return;
        setActions(data.actions);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Failed to load audit log.";
        toast.show(message, "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [userId, toast]);

  if (loading) {
    return <div className="text-sm text-ink-muted">Loading audit log&hellip;</div>;
  }
  if (actions.length === 0) {
    return (
      <div className="border border-line rounded-card bg-cream-card p-6 text-sm text-ink-muted text-center">
        No admin actions on this user.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line border border-line rounded-card bg-cream-card">
      {actions.map((action) => (
        <AuditRow key={action.id} action={action} />
      ))}
    </ul>
  );
}
