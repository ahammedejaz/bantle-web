"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminToast } from "./AdminToastProvider";
import { listingTermsSummary, listingTypeLabel } from "@/lib/adminTerms";
import { cn } from "@/lib/utils";

interface ListingRow {
  id: string;
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
  created_at: string | null;
  archived_at: string | null;
}

const PAGE_SIZE = 20;

// listings.status has NO check constraint in the production schema —
// recon Query 4 confirmed. Render the raw value with a defensive
// fallback for null / unknown values rather than mapping to an enum.
function statusDisplay(status: string | null): {
  label: string;
  className: string;
} {
  if (!status) {
    return {
      label: "—",
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

export function UserListingsTab({ userId }: { userId: string }) {
  const toast = useAdminToast();
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/admin/api/users/${userId}/listings?page=${page}`,
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as {
        listings: ListingRow[];
        total: number;
      };
      setListings(data.listings);
      setTotal(data.total);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to load listings.";
      toast.show(message, "error");
    } finally {
      setLoading(false);
    }
  }, [userId, page, toast]);

  useEffect(() => {
    void fetchListings();
  }, [fetchListings]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (loading && listings.length === 0) {
    return <div className="text-sm text-ink-muted">Loading listings&hellip;</div>;
  }
  if (listings.length === 0) {
    return (
      <div className="border border-line rounded-card bg-cream-card p-6 text-sm text-ink-muted text-center">
        No listings.
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto -mx-4 md:mx-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-ink-muted uppercase tracking-[0.1em]">
              <th className="text-left px-4 py-2 font-normal">Title</th>
              <th className="text-left px-4 py-2 font-normal">Platform</th>
              <th className="text-left px-4 py-2 font-normal">Terms</th>
              <th className="text-right px-4 py-2 font-normal">Slots</th>
              <th className="text-left px-4 py-2 font-normal">Status</th>
              <th className="text-left px-4 py-2 font-normal">Created</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => {
              const display = statusDisplay(listing.status);
              return (
                <tr
                  key={listing.id}
                  className="border-b border-line last:border-0"
                >
                  <td className="px-4 py-3 text-ink">{listing.title}</td>
                  <td className="px-4 py-3 text-ink-muted">{listing.platform}</td>
                  <td className="px-4 py-3 text-ink">
                    <p>{listingTypeLabel(listing)}</p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {listingTermsSummary(listing)}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right text-ink">
                    {listing.listing_type === "one_time"
                      ? "1"
                      : listing.slots_total}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-button border",
                        display.className,
                      )}
                    >
                      {display.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-muted">
                    {listing.created_at
                      ? new Date(listing.created_at).toLocaleDateString(
                          "en-IN",
                          { month: "short", day: "numeric", year: "numeric" },
                        )
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between mt-4 text-sm">
          <button
            type="button"
            disabled={page === 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-button border border-line text-ink hover:bg-cream disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <span className="text-ink-muted">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page === totalPages || loading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 rounded-button border border-line text-ink hover:bg-cream disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
