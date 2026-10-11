"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BellRing,
  ClipboardList,
  Flag,
  Handshake,
  Inbox,
  Layers,
  ListChecks,
  RefreshCw,
  ScrollText,
  ShieldCheck,
  UserRoundPen,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useAdminToast } from "@/components/admin/AdminToastProvider";
import type { DashboardData } from "@/lib/admin-dashboard-metrics";
import { cn } from "@/lib/utils";

type Metric = {
  label: string;
  value: number;
  helper: string;
  href: string;
  icon: LucideIcon;
  tone?: "default" | "attention" | "quiet";
};

export function DashboardClient({
  initialData,
}: {
  /** Server-rendered metrics; null when the server-side fetch failed. */
  initialData: DashboardData | null;
}) {
  const toast = useAdminToast();
  const [data, setData] = useState<DashboardData | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/admin/api/dashboard", {
        cache: "no-store",
      });
      if (!response.ok) {
        const body = (await response
          .json()
          .catch(() => ({ error: `HTTP ${response.status}` }))) as {
          error?: string;
        };
        throw new Error(body.error ?? `HTTP ${response.status}`);
      }
      setData((await response.json()) as DashboardData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load dashboard.";
      setError(message);
      toast.show(message, "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Only fetch on mount when the server could not provide data; the normal
  // path arrives with metrics already rendered.
  useEffect(() => {
    if (!initialData) void fetchDashboard();
  }, [initialData, fetchDashboard]);

  if (loading && !data) {
    return <DashboardLoading />;
  }

  if (error && !data) {
    return (
      <div className="border border-red-200 bg-red-50 rounded-card p-5">
        <p className="text-sm font-medium text-red-900">
          Dashboard metrics could not load.
        </p>
        <p className="text-sm text-red-800 mt-1">{error}</p>
        <button
          type="button"
          onClick={() => void fetchDashboard()}
          className="mt-4 inline-flex items-center gap-2 rounded-button border border-red-200 px-3 py-2 text-sm font-medium text-red-900 hover:bg-red-100"
        >
          <RefreshCw size={14} />
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  // The review queues: every number here is a human waiting on an admin
  // decision, so anything above zero carries the attention tone. This band is
  // the reason the dashboard exists.
  const queues: Metric[] = [
    {
      label: "Open reports",
      value: data.reports.open,
      helper: `${fmt(data.reports.new_7d)} new in 7 days`,
      href: "/admin/reports",
      icon: Flag,
      tone: data.reports.open > 0 ? "attention" : "default",
    },
    {
      label: "Identity verifications",
      value: data.queues.identity_verifications_pending,
      helper: "Waiting for review",
      href: "/admin/identity-verifications",
      icon: ShieldCheck,
      tone:
        data.queues.identity_verifications_pending > 0
          ? "attention"
          : "default",
    },
    {
      label: "Name change requests",
      value: data.queues.name_change_requests_pending,
      helper: "Waiting for review",
      href: "/admin/name-change-requests",
      icon: UserRoundPen,
      tone:
        data.queues.name_change_requests_pending > 0 ? "attention" : "default",
    },
    {
      label: "Platform requests",
      value: data.queues.platform_requests_pending,
      helper: "Waiting for review",
      href: "/admin/platform-requests",
      icon: Inbox,
      tone: data.queues.platform_requests_pending > 0 ? "attention" : "default",
    },
    {
      label: "Disputed deals",
      value: data.deals.disputed,
      helper: "Open disputes between users",
      href: "/admin/deals",
      icon: AlertTriangle,
      tone: data.deals.disputed > 0 ? "attention" : "default",
    },
  ];

  const snapshot: Metric[] = [
    {
      label: "Active users",
      value: data.users.active,
      helper: `${fmt(data.users.with_push_token)} with push tokens`,
      href: "/admin/users",
      icon: Users,
    },
    {
      label: "Active listings",
      value: data.listings.active,
      helper: `${fmt(data.listings.closed)} closed total`,
      href: "/admin/listings",
      icon: ListChecks,
    },
    {
      label: "Active deals",
      value: data.deals.active,
      helper: `${fmt(data.deals.pending)} pending acceptance`,
      href: "/admin/deals",
      icon: Handshake,
    },
    {
      label: "Inactive platforms",
      value: data.platforms.inactive,
      helper: `${fmt(data.platforms.active)} active platforms`,
      href: "/admin/platforms",
      icon: Layers,
      tone: data.platforms.inactive > 0 ? "quiet" : "default",
    },
    {
      label: "Recent admin actions",
      value: data.audit.actions_7d,
      helper: `${fmt(data.audit.total_actions)} total actions`,
      href: "/admin/audit",
      icon: ScrollText,
    },
  ];

  const broadcastIssues = data.broadcasts.partial_failure + data.broadcasts.failed;
  const volume: Metric[] = [
    {
      label: "New users",
      value: data.users.new_7d,
      helper: `${fmt(data.users.new_30d)} in 30 days`,
      href: "/admin/users",
      icon: Users,
    },
    {
      label: "New listings",
      value: data.listings.created_7d,
      helper: `${fmt(data.listings.created_30d)} in 30 days`,
      href: "/admin/listings",
      icon: ListChecks,
    },
    {
      label: "New deals",
      value: data.deals.created_7d,
      helper: `${fmt(data.deals.created_30d)} in 30 days`,
      href: "/admin/deals",
      icon: Handshake,
    },
    {
      label: "Broadcasts sent",
      value: data.broadcasts.sent_7d,
      helper:
        broadcastIssues > 0
          ? `${fmt(broadcastIssues)} failed or partial, all time`
          : `${fmt(data.broadcasts.sent_30d)} in 30 days`,
      href: "/admin/broadcasts",
      icon: BellRing,
      tone: broadcastIssues > 0 ? "quiet" : "default",
    },
  ];

  const moderation: Metric[] = [
    {
      label: "Temp banned users",
      value: data.users.temporarily_banned,
      helper: "Currently active temp bans",
      href: "/admin/users",
      icon: AlertTriangle,
    },
    {
      label: "Permanent bans",
      value: data.users.permanently_banned,
      helper: `${fmt(data.users.deleted)} deleted profiles`,
      href: "/admin/users",
      icon: ShieldCheck,
    },
    {
      label: "Listing closures",
      value: data.audit.listing_closed_actions,
      helper: `${fmt(data.listings.archived)} archived listings`,
      href: "/admin/listings",
      icon: ClipboardList,
    },
    {
      label: "Deal terminations",
      value: data.audit.deal_terminated_actions,
      helper: `${fmt(data.deals.cancelled)} cancelled deals total`,
      href: "/admin/deals",
      icon: Activity,
    },
  ];

  // Every module in the nav, so this panel and the sidebar never disagree
  // about what exists.
  const quickLinks = [
    {
      href: "/admin/reports",
      label: "Reports",
      helper: `${fmt(data.reports.open)} open`,
      icon: Flag,
    },
    {
      href: "/admin/users",
      label: "Users",
      helper: `${fmt(data.users.total)} total`,
      icon: Users,
    },
    {
      href: "/admin/identity-verifications",
      label: "Identity verification",
      helper: `${fmt(data.queues.identity_verifications_pending)} pending`,
      icon: ShieldCheck,
    },
    {
      href: "/admin/settings/deal-reputation",
      label: "Deal reputation",
      helper: "Settings",
      icon: ListChecks,
    },
    {
      href: "/admin/name-change-requests",
      label: "Name changes",
      helper: `${fmt(data.queues.name_change_requests_pending)} pending`,
      icon: UserRoundPen,
    },
    {
      href: "/admin/listings",
      label: "Listings",
      helper: `${fmt(data.listings.active)} active`,
      icon: ListChecks,
    },
    {
      href: "/admin/deals",
      label: "Deals",
      helper: `${fmt(data.deals.active)} active`,
      icon: Handshake,
    },
    {
      href: "/admin/audit",
      label: "Audit log",
      helper: "Read-only",
      icon: ScrollText,
    },
    {
      href: "/admin/broadcasts",
      label: "Broadcasts",
      helper: "Incident-only",
      icon: BellRing,
    },
    {
      href: "/admin/platforms",
      label: "Platforms",
      helper: `${fmt(data.platforms.total)} configured`,
      icon: Layers,
    },
    {
      href: "/admin/platform-requests",
      label: "Platform requests",
      helper: `${fmt(data.queues.platform_requests_pending)} pending`,
      icon: Inbox,
    },
  ];

  const pendingTotal =
    data.reports.open +
    data.queues.identity_verifications_pending +
    data.queues.name_change_requests_pending +
    data.queues.platform_requests_pending +
    data.deals.disputed;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-end gap-3">
        <span className="text-xs text-ink-muted">
          Updated {fmtTime(data.generated_at)}
        </span>
        <button
          type="button"
          onClick={() => void fetchDashboard()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-button border border-line px-3 py-2 text-sm font-medium text-ink hover:bg-cream-card disabled:opacity-60"
        >
          <RefreshCw
            size={14}
            className={cn(loading && "animate-spin")}
          />
          Refresh
        </button>
      </div>

      <DashboardSection
        eyebrow="Review queues"
        title="What needs attention now"
        description={
          pendingTotal === 0
            ? "All queues are clear."
            : `${fmt(pendingTotal)} item${pendingTotal === 1 ? "" : "s"} waiting on an admin decision.`
        }
      >
        <MetricGrid metrics={queues} />
      </DashboardSection>

      <DashboardSection
        eyebrow="Operational snapshot"
        title="State of the platform"
      >
        <MetricGrid metrics={snapshot} />
      </DashboardSection>

      <DashboardSection
        eyebrow="Volume"
        title="Recent platform activity"
        description="Read-only operational volume. No marketing or re-engagement analytics."
      >
        <MetricGrid metrics={volume} columns="four" />
      </DashboardSection>

      <DashboardSection
        eyebrow="Moderation"
        title="Admin action posture"
      >
        <MetricGrid metrics={moderation} columns="four" />
      </DashboardSection>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.75fr)]">
        <section className="border border-line rounded-card bg-cream-card">
          <div className="p-5 border-b border-line">
            <p className="text-xs uppercase tracking-[0.14em] text-teal-600 font-medium">
              Audit
            </p>
            <h2 className="mt-1 text-lg font-semibold text-teal-950">
              Recent admin actions
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Read-only trail of the latest admin operations.
            </p>
          </div>
          {data.audit.latest_actions.length === 0 ? (
            <div className="p-5 text-sm text-ink-muted">
              No admin actions recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-line">
              {data.audit.latest_actions.map((action) => (
                <div
                  key={action.id}
                  className="p-4 flex items-start justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">
                      {humanize(action.action_type)}
                    </p>
                    <p className="mt-1 text-xs text-ink-muted truncate">
                      {action.target_resource_type ?? "No resource"}
                      {action.target_resource_id
                        ? ` · ${shortId(action.target_resource_id)}`
                        : ""}
                    </p>
                    <p className="mt-1 text-xs text-ink-muted truncate">
                      {action.admin?.display_name ??
                        action.admin?.email ??
                        "Unknown admin"}
                    </p>
                  </div>
                  <time className="shrink-0 text-xs text-ink-muted">
                    {fmtDate(action.created_at)}
                  </time>
                </div>
              ))}
            </div>
          )}
          <div className="p-4 border-t border-line">
            <Link
              href="/admin/audit"
              className="text-sm font-medium text-teal-800 hover:text-teal-950"
            >
              Open full audit log
            </Link>
          </div>
        </section>

        <section className="border border-line rounded-card bg-cream-card p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-teal-600 font-medium">
            Quick links
          </p>
          <h2 className="mt-1 text-lg font-semibold text-teal-950">
            Admin modules
          </h2>
          <div className="mt-5 grid gap-2">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-button border border-line bg-cream px-3 py-3 text-sm hover:bg-teal-50"
                >
                  <Icon size={16} className="text-teal-700" />
                  <span className="font-medium text-ink">{item.label}</span>
                  <span className="ml-auto text-xs text-ink-muted">
                    {item.helper}
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="mt-5 space-y-3 text-sm text-ink-muted">
            <p>
              Broadcasts are for incident/service notices only, not marketing
              or re-engagement.
            </p>
            <p>Audit log access is read-only. No edit, delete, or export tools.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

function DashboardSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.14em] text-teal-600 font-medium">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-lg font-semibold text-teal-950">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-ink-muted">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function MetricGrid({
  metrics,
  columns = "three",
}: {
  metrics: Metric[];
  columns?: "three" | "four";
}) {
  return (
    <div
      className={cn(
        "grid gap-3",
        columns === "four"
          ? "sm:grid-cols-2 xl:grid-cols-4"
          : "sm:grid-cols-2 xl:grid-cols-3",
      )}
    >
      {metrics.map((metric) => (
        <MetricCard key={metric.label} metric={metric} />
      ))}
    </div>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  const Icon = metric.icon;
  return (
    <Link
      href={metric.href}
      className={cn(
        "block border rounded-card bg-cream-card p-4 hover:bg-teal-50 transition-colors",
        metric.tone === "attention" ? "border-amber-300" : "border-line",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink-muted">{metric.label}</p>
        <span
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-full border",
            metric.tone === "attention"
              ? "border-amber-200 bg-amber-50 text-amber-900"
              : "border-line bg-cream text-teal-800",
          )}
        >
          <Icon size={16} />
        </span>
      </div>
      <p className="mt-4 text-3xl font-semibold text-teal-950">
        {fmt(metric.value)}
      </p>
      <p className="mt-1 text-xs text-ink-muted">{metric.helper}</p>
    </Link>
  );
}

function DashboardLoading() {
  return (
    <div className="space-y-8">
      {[0, 1, 2].map((section) => (
        <section key={section}>
          <div className="mb-4 h-5 w-48 rounded bg-cream-card border border-line" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-36 rounded-card border border-line bg-cream-card animate-pulse"
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function fmt(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function fmtTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "just now";
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString(undefined, {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  });
}

function humanize(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function shortId(value: string) {
  if (value.length <= 14) return value;
  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}
