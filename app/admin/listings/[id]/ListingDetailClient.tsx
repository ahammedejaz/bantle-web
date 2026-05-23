"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronLeft, ExternalLink } from "lucide-react";
import { useAdminToast } from "@/components/admin/AdminToastProvider";
import {
  ListingCloseModal,
  type ListingCloseResponse,
} from "@/components/admin/ListingCloseModal";
import {
  ArchivedBadge,
  ListingStatusBadge,
} from "@/components/admin/ListingStatusBadge";
import { cn } from "@/lib/utils";

interface ProfileSummary {
  id: string;
  display_name: string | null;
  email: string | null;
  deleted_at: string | null;
  banned_until?: string | null;
  banned_reason?: string | null;
  permanently_banned?: boolean | null;
  rating_avg?: number | null;
  rating_count?: number | null;
  is_admin?: boolean | null;
}

interface ListingDetail {
  id: string;
  user_id: string;
  title: string;
  platform: string;
  category: string;
  description: string | null;
  monthly_price: number;
  slots_total: number;
  slots_available: number | null;
  duration_months: number;
  status: string | null;
  archived_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  closed_reason: string | null;
  closed_by: string | null;
  closed_at: string | null;
  host: ProfileSummary | null;
}

interface DealRow {
  id: string;
  status: string | null;
  agreed_price: number;
  duration_months: number | null;
  started_at: string | null;
  ends_at: string | null;
  terminated_at: string | null;
  created_at: string | null;
  host_id: string | null;
  buyer_id: string | null;
  host: ProfileSummary | ProfileSummary[] | null;
  buyer: ProfileSummary | ProfileSummary[] | null;
}

interface AuditEntry {
  id: string;
  admin_id: string | null;
  action_type: string;
  target_user_id: string | null;
  target_resource_id: string | null;
  target_resource_type: string | null;
  reason: string | null;
  payload: Record<string, unknown> | null;
  created_at: string | null;
}

interface ListingDetailResponse {
  listing: ListingDetail;
  host: ProfileSummary | null;
  active_pending_deals: DealRow[];
  recent_deals: DealRow[];
  audit_entries: AuditEntry[];
  host_report_counts: {
    pending: number;
    total: number;
  } | null;
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
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

function profileFromRelation(
  value: ProfileSummary | ProfileSummary[] | null,
): ProfileSummary | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

function profileName(profile: ProfileSummary | null | undefined): string {
  if (!profile) return "Missing profile";
  if (profile.display_name?.trim()) return profile.display_name;
  return profile.email ?? "Unnamed user";
}

function dealStatusClass(status: string | null): string {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-900 border-amber-200";
    case "active":
      return "bg-teal-50 text-teal-900 border-teal-200";
    case "completed":
      return "bg-teal-100 text-teal-900 border-teal-300";
    case "disputed":
      return "bg-red-50 text-red-900 border-red-200";
    case "cancelled":
      return "bg-gray-100 text-gray-700 border-gray-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

export function ListingDetailClient({ listingId }: { listingId: string }) {
  const toast = useAdminToast();
  const [data, setData] = useState<ListingDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [closeOpen, setCloseOpen] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/admin/api/listings/${listingId}`);
      if (!response.ok) {
        const body = (await response
          .json()
          .catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `HTTP ${response.status}`);
      }
      const json = (await response.json()) as ListingDetailResponse;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load listing.");
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  const handleClosed = (response: ListingCloseResponse) => {
    setCloseOpen(false);
    const summary = response.notification_summary;
    const hasWarning =
      summary.notification_failed_count > 0 ||
      summary.push_failure_count > 0 ||
      summary.warnings.length > 0;
    toast.show(
      response.already_closed
        ? "Listing was already closed."
        : hasWarning
          ? "Listing closed. Notification or push had warnings."
          : "Listing closed.",
      hasWarning ? "error" : "success",
    );
    void fetchDetail();
  };

  if (loading && !data) {
    return <div className="text-ink-muted">Loading listing&hellip;</div>;
  }

  if (error || !data) {
    return (
      <div>
        <BackLink />
        <div className="bg-red-50 border border-red-200 rounded-card p-4 text-red-900 text-sm">
          {error ?? "Listing not found"}
        </div>
      </div>
    );
  }

  const {
    listing,
    host,
    active_pending_deals: activePendingDeals,
    recent_deals: recentDeals,
    audit_entries: auditEntries,
    host_report_counts: hostReportCounts,
  } = data;
  const pendingDealCount = activePendingDeals.filter(
    (deal) => deal.status === "pending",
  ).length;
  const activeDealCount = activePendingDeals.filter(
    (deal) => deal.status === "active",
  ).length;
  const canClose = listing.status === "active";

  return (
    <div>
      <BackLink />

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <ListingStatusBadge status={listing.status} />
          <ArchivedBadge archivedAt={listing.archived_at} />
          <span className="text-xs text-ink-muted">
            Created {fmtDate(listing.created_at)}
          </span>
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h1 className="font-serif italic text-3xl md:text-4xl text-teal-900 leading-[1.1]">
              {listing.title}
            </h1>
            <p className="text-sm text-ink-muted mt-2">
              {listing.platform} · {listing.category} · Rs.{" "}
              {listing.monthly_price}/mo · {listing.duration_months} mo
            </p>
            <p className="text-xs text-ink-muted mt-1 font-mono break-all">
              {listing.id}
            </p>
          </div>
          {canClose ? (
            <button
              type="button"
              onClick={() => setCloseOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-button bg-red-700 text-cream text-sm font-medium hover:bg-red-800 transition-colors"
            >
              <AlertTriangle size={16} />
              Force-close
            </button>
          ) : null}
        </div>
      </div>

      {activePendingDeals.length > 0 ? (
        <div className="flex gap-2 rounded-card border border-amber-200 bg-amber-50 p-4 mb-6 text-amber-900">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Active or pending deals exist</p>
            <p className="text-sm mt-1">
              Force-closing this listing removes it from discovery only.
              Existing deals and chats continue unchanged.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <CountBlock
          label="Slots"
          value={`${listing.slots_available ?? "?"}/${listing.slots_total}`}
        />
        <CountBlock label="Active deals" value={activeDealCount} />
        <CountBlock label="Pending deals" value={pendingDealCount} />
        <CountBlock label="Updated" value={fmtDate(listing.updated_at)} />
      </div>

      {listing.closed_at || listing.status === "closed" ? (
        <section className="mb-6 bg-gray-50 border border-gray-200 rounded-card p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-gray-700 mb-2">
            Closed info
          </p>
          <p className="text-sm text-gray-800">
            Closed {fmtDate(listing.closed_at)}
          </p>
          {listing.closed_reason ? (
            <p className="text-sm text-gray-800 mt-2 whitespace-pre-wrap">
              {listing.closed_reason}
            </p>
          ) : null}
          {listing.closed_by ? (
            <p className="text-xs text-gray-600 mt-2 font-mono break-all">
              Closed by {listing.closed_by}
            </p>
          ) : null}
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 mb-6">
        <div className="bg-cream-card border border-line rounded-card p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-2">
            Host
          </p>
          {host ? (
            <>
              <Link
                href={`/admin/users/${host.id}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-teal-800 hover:text-teal-900"
              >
                {profileName(host)}
                <ExternalLink size={12} />
              </Link>
              <p className="text-xs text-ink-muted mt-1 truncate">
                {host.email ?? "No email"}
              </p>
              <p className="text-xs text-ink-muted mt-2">
                {host.rating_count
                  ? `${host.rating_avg?.toFixed(1) ?? "0.0"} rating · ${
                      host.rating_count
                    } review${host.rating_count === 1 ? "" : "s"}`
                  : "No ratings"}
              </p>
            </>
          ) : (
            <p className="text-sm text-ink-muted">Host profile missing.</p>
          )}
        </div>

        <div className="bg-cream-card border border-line rounded-card p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-2">
            Reports against host
          </p>
          <p className="text-sm text-ink">
            {hostReportCounts?.pending ?? 0} pending
          </p>
          <p className="text-xs text-ink-muted mt-1">
            {hostReportCounts?.total ?? 0} total report
            {(hostReportCounts?.total ?? 0) === 1 ? "" : "s"}
          </p>
        </div>
      </section>

      {listing.description ? (
        <section className="mb-6 bg-cream-card border border-line rounded-card p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-2">
            Description
          </p>
          <p className="text-sm text-ink whitespace-pre-wrap">
            {listing.description}
          </p>
        </section>
      ) : null}

      <section className="mb-6">
        <h2 className="font-serif italic text-2xl text-teal-900 mb-3">
          Active and pending deals
        </h2>
        {activePendingDeals.length === 0 ? (
          <EmptyBlock>No active or pending deals.</EmptyBlock>
        ) : (
          <div className="space-y-3">
            {activePendingDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </section>

      <section className="mb-6">
        <h2 className="font-serif italic text-2xl text-teal-900 mb-3">
          Recent deals
        </h2>
        {recentDeals.length === 0 ? (
          <EmptyBlock>No recent deals.</EmptyBlock>
        ) : (
          <div className="space-y-3">
            {recentDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-serif italic text-2xl text-teal-900 mb-3">
          Audit entries
        </h2>
        {auditEntries.length === 0 ? (
          <EmptyBlock>No listing audit entries.</EmptyBlock>
        ) : (
          <div className="space-y-3">
            {auditEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-cream-card border border-line rounded-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {entry.action_type}
                    </p>
                    {entry.reason ? (
                      <p className="text-sm text-ink-muted mt-1">
                        {entry.reason}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-xs text-ink-muted shrink-0">
                    {fmtDate(entry.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <ListingCloseModal
        open={closeOpen}
        listingId={listing.id}
        listingTitle={listing.title}
        activeDealCount={activeDealCount}
        pendingDealCount={pendingDealCount}
        onOpenChange={setCloseOpen}
        onClosed={handleClosed}
        onError={(message) => toast.show(message, "error")}
      />
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/admin/listings"
      className="inline-flex items-center text-sm text-teal-700 hover:text-teal-900 mb-4"
    >
      <ChevronLeft size={14} className="mr-1" /> Back to listings
    </Link>
  );
}

function CountBlock({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="p-3 rounded-card border border-line bg-cream-card">
      <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-1">
        {label}
      </p>
      <p className="text-lg font-medium text-ink">{value}</p>
    </div>
  );
}

function EmptyBlock({ children }: { children: string }) {
  return (
    <div className="border border-line rounded-card bg-cream-card p-6 text-sm text-ink-muted text-center">
      {children}
    </div>
  );
}

function DealCard({ deal }: { deal: DealRow }) {
  const host = profileFromRelation(deal.host);
  const buyer = profileFromRelation(deal.buyer);

  return (
    <div className="bg-cream-card border border-line rounded-card p-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-button border",
                dealStatusClass(deal.status),
              )}
            >
              {deal.status ?? "unknown"}
            </span>
            <span className="text-xs text-ink-muted">
              Created {fmtDate(deal.created_at)}
            </span>
          </div>
          <p className="text-sm text-ink">
            Host: <span className="font-medium">{profileName(host)}</span>
          </p>
          <p className="text-sm text-ink">
            Buyer: <span className="font-medium">{profileName(buyer)}</span>
          </p>
          <p className="text-xs text-ink-muted mt-1 font-mono break-all">
            {deal.id}
          </p>
        </div>
        <div className="text-right text-xs text-ink-muted shrink-0">
          <p>Rs. {deal.agreed_price}</p>
          {deal.duration_months ? <p>{deal.duration_months} mo</p> : null}
          {deal.started_at ? <p>Started {fmtDate(deal.started_at)}</p> : null}
          {deal.ends_at ? <p>Ends {fmtDate(deal.ends_at)}</p> : null}
          {deal.terminated_at ? (
            <p>Terminated {fmtDate(deal.terminated_at)}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
