"use client";

import Link from "next/link";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { ArchivedBadge, ListingStatusBadge } from "./ListingStatusBadge";
import { listingTermsSummary, listingTypeLabel } from "@/lib/adminTerms";

export interface ListingListItem {
  id: string;
  user_id: string;
  title: string;
  platform: string;
  category: string;
  listing_type: string;
  monthly_price: number;
  one_time_price?: number | null;
  slots_total: number;
  duration_months: number;
  terms_type?: string | null;
  access_duration_months?: number | null;
  access_type?: string | null;
  access_notes?: string | null;
  status: string | null;
  archived_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  closed_reason: string | null;
  closed_by: string | null;
  closed_at: string | null;
  slots_available: number | null;
  pending_deal_count: number;
  active_deal_count: number;
  host: {
    id: string;
    display_name: string | null;
    email: string | null;
    deleted_at: string | null;
    banned_until: string | null;
    permanently_banned: boolean | null;
    is_admin?: boolean | null;
  } | null;
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "Unknown date";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function hostLabel(host: ListingListItem["host"]): string {
  if (!host) return "Missing host";
  if (host.display_name?.trim()) return host.display_name;
  return host.email ?? "Unnamed host";
}

export function ListingRow({ listing }: { listing: ListingListItem }) {
  const activeDealCount = listing.active_deal_count;
  const pendingDealCount = listing.pending_deal_count;
  const dealCount = activeDealCount + pendingDealCount;

  return (
    <Link
      href={`/admin/listings/${listing.id}`}
      className="block border border-line rounded-card bg-cream-card p-4 hover:border-teal-200 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-sm font-medium text-ink truncate">
              {listing.title}
            </span>
            <ListingStatusBadge status={listing.status} />
            <ArchivedBadge archivedAt={listing.archived_at} />
            {dealCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-button border bg-amber-50 text-amber-900 border-amber-200">
                <AlertTriangle size={12} />
                {activeDealCount} active / {pendingDealCount} pending
              </span>
            ) : null}
          </div>

          <p className="text-xs text-ink-muted truncate">
            {listing.platform} · {listing.category} · {hostLabel(listing.host)}
          </p>
          <p className="text-xs text-ink-muted mt-1">
            {listingTypeLabel(listing)} · {listingTermsSummary(listing)} ·{" "}
            {listing.listing_type === "one_time"
              ? "1 access spot"
              : `${listing.slots_available ?? "?"}/${
                  listing.slots_total
                } slots`}
          </p>
          {listing.closed_at ? (
            <p className="text-xs text-amber-900 mt-2">
              Closed {fmtDate(listing.closed_at)}
              {listing.closed_reason ? `: ${listing.closed_reason}` : ""}
            </p>
          ) : null}
        </div>

        <div className="text-right text-xs text-ink-muted shrink-0">
          <p>Created {fmtDate(listing.created_at)}</p>
          <p className="font-mono mt-1 max-w-[8rem] truncate">{listing.id}</p>
        </div>

        <ChevronRight size={16} className="text-ink-muted shrink-0 mt-1" />
      </div>
    </Link>
  );
}
