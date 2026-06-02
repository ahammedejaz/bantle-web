"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminToast } from "./AdminToastProvider";
import { dealTermsSummary, dealTermsType } from "@/lib/adminTerms";
import { cn } from "@/lib/utils";

interface DealRow {
  id: string;
  status: string | null;
  agreed_price: number;
  duration_months: number | null;
  started_at: string | null;
  ends_at: string | null;
  terminated_at: string | null;
  created_at: string | null;
  terms_snapshot: {
    terms_type: string | null;
    price_amount: number | null;
    price_period: string | null;
    duration_months: number | null;
    access_duration_months: number | null;
    access_type: string | null;
    access_notes_snapshot: string | null;
  } | null;
  host_id: string | null;
  buyer_id: string | null;
  host: { display_name: string | null } | null;
  buyer: { display_name: string | null } | null;
}

const PAGE_SIZE = 20;

// deals.status has a CHECK constraint with these 5 values
// (recon Query 4). Anything else is unexpected — render raw with
// neutral styling.
function statusDisplay(status: string | null): {
  label: string;
  className: string;
} {
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
        label: status ?? "—",
        className: "bg-gray-50 text-gray-700 border-gray-200",
      };
  }
}

function counterpartyName(
  deal: DealRow,
  viewerId: string,
): { role: "Host" | "Buyer"; name: string } {
  const isHost = deal.host_id === viewerId;
  const role = isHost ? "Host" : "Buyer";
  // The "other" side is the counterparty whose display_name we show.
  const counterparty = isHost ? deal.buyer : deal.host;
  const counterpartyId = isHost ? deal.buyer_id : deal.host_id;

  // deals.host_id / buyer_id are SET NULL on profile delete (recon
  // Query 5). If the counterparty id is null, the row survived but
  // the counterparty profile was hard-deleted.
  if (!counterpartyId) {
    return { role, name: "(deleted user)" };
  }
  return {
    role,
    name:
      counterparty?.display_name && counterparty.display_name.trim()
        ? counterparty.display_name
        : "Unnamed user",
  };
}

export function UserDealsTab({ userId }: { userId: string }) {
  const toast = useAdminToast();
  const [deals, setDeals] = useState<DealRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/admin/api/users/${userId}/deals?page=${page}`,
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as {
        deals: DealRow[];
        total: number;
      };
      setDeals(data.deals);
      setTotal(data.total);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to load deals.";
      toast.show(message, "error");
    } finally {
      setLoading(false);
    }
  }, [userId, page, toast]);

  useEffect(() => {
    void fetchDeals();
  }, [fetchDeals]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (loading && deals.length === 0) {
    return <div className="text-sm text-ink-muted">Loading deals&hellip;</div>;
  }
  if (deals.length === 0) {
    return (
      <div className="border border-line rounded-card bg-cream-card p-6 text-sm text-ink-muted text-center">
        No deals.
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-3">
        {deals.map((deal) => {
          const cp = counterpartyName(deal, userId);
          const status = statusDisplay(deal.status);
          const isOneTime = dealTermsType(deal) === "one_time";
          return (
            <div
              key={deal.id}
              className="border border-line rounded-card bg-cream-card p-4"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs uppercase tracking-[0.1em] text-teal-600 font-medium">
                      {cp.role}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-button border",
                        status.className,
                      )}
                    >
                      {status.label}
                    </span>
                  </div>
                  <p className="text-sm text-ink">
                    Counterparty:{" "}
                    <span className="font-medium">{cp.name}</span>
                  </p>
                  <p className="text-xs text-ink-muted mt-1">
                    {isOneTime ? "One-time access" : "Monthly sharing"} ·{" "}
                    {dealTermsSummary(deal)}
                  </p>
                </div>
                <div className="text-right text-xs text-ink-muted shrink-0">
                  {deal.created_at ? (
                    <p>
                      Created{" "}
                      {new Date(deal.created_at).toLocaleDateString(
                        "en-IN",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </p>
                  ) : null}
                  {deal.started_at ? (
                    <p>
                      Started{" "}
                      {new Date(deal.started_at).toLocaleDateString(
                        "en-IN",
                        {
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </p>
                  ) : null}
                  {deal.ends_at ? (
                    <p>
                      Ends{" "}
                      {new Date(deal.ends_at).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
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
