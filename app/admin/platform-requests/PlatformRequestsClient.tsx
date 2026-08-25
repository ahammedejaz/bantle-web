"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ExternalLink, Filter } from "lucide-react";
import { useAdminToast } from "@/components/admin/AdminToastProvider";
import { cn } from "@/lib/utils";
import {
  fmtDate,
  getRequestStatusDisplay,
  type PlatformRequestStatus,
} from "./platformRequestStatus";

interface PlatformRequestListItem {
  id: string;
  user_id: string;
  requested_name: string;
  suggested_category: string | null;
  user_note: string | null;
  status: PlatformRequestStatus;
  approved_platform_id: string | null;
  requested_at: string;
  reviewed_at: string | null;
  user: {
    id: string;
    display_name: string | null;
    is_verified: boolean | null;
  } | null;
}

type StatusFilter = PlatformRequestStatus | "all";

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "pending", label: "Pending" },
  { value: "all", label: "All statuses" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export function PlatformRequestsClient() {
  const toast = useAdminToast();
  const [status, setStatus] = useState<StatusFilter>("pending");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<PlatformRequestListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status, page: page.toString() });
      const response = await fetch(`/admin/api/platform-requests?${params}`);
      if (!response.ok) {
        const data = (await response
          .json()
          .catch(() => ({ error: `HTTP ${response.status}` }))) as {
          error?: string;
        };
        throw new Error(data.error ?? `HTTP ${response.status}`);
      }
      const data = (await response.json()) as {
        requests: PlatformRequestListItem[];
        total: number;
        page_size: number;
      };
      setItems(data.requests);
      setTotal(data.total);
      setPageSize(data.page_size);
    } catch (error) {
      toast.show(
        error instanceof Error
          ? error.message
          : "Platform requests could not be loaded.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [page, status, toast]);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    setPage(1);
  }, [status]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="inline-flex items-center gap-2 text-xs text-ink-muted">
          <Filter size={14} />
          Filter
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as StatusFilter)}
          className="text-sm bg-cream-card border border-line rounded-button px-3 py-1.5 text-ink focus:outline-none focus:ring-2 focus:ring-teal-900"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-ink-muted ml-auto">
          {loading ? "Loading…" : `${total} result${total === 1 ? "" : "s"}`}
        </span>
      </div>

      {items.length === 0 && !loading ? (
        <div className="border border-line rounded-card bg-cream-card p-8 text-center text-ink-muted">
          No platform requests match this filter.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <PlatformRequestRow key={item.id} item={item} />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-between mt-6 text-sm">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1 || loading}
            className={paginationButtonClass}
          >
            <ChevronLeft size={14} />
            Prev
          </button>
          <span className="text-ink-muted">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            disabled={page === totalPages || loading}
            className={paginationButtonClass}
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function PlatformRequestRow({ item }: { item: PlatformRequestListItem }) {
  const statusDisplay = getRequestStatusDisplay(item.status);

  return (
    <Link
      href={`/admin/platform-requests/${item.id}`}
      className="block border border-line rounded-card bg-cream-card p-4 hover:border-teal-200 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-medium text-ink break-words">
              {item.requested_name}
            </span>
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-button border",
                statusDisplay.className,
              )}
            >
              {statusDisplay.label}
            </span>
            <span className="text-xs text-ink-muted font-mono">
              #{item.id.slice(0, 8)}
            </span>
          </div>
          <p className="text-xs text-ink-muted">
            Requested by {item.user?.display_name ?? "Unknown user"}
            {item.suggested_category
              ? ` · suggested category: ${item.suggested_category}`
              : " · no category suggested"}
          </p>
          {item.user_note ? (
            <p className="text-xs text-ink-muted mt-1 line-clamp-2">
              &ldquo;{item.user_note}&rdquo;
            </p>
          ) : null}
          <p className="text-xs text-ink-muted mt-1">
            {fmtDate(item.requested_at)}
            {item.reviewed_at ? ` · reviewed ${fmtDate(item.reviewed_at)}` : ""}
            {item.approved_platform_id
              ? ` · created ${item.approved_platform_id}`
              : ""}
          </p>
        </div>
        <ExternalLink size={16} className="text-ink-muted shrink-0 mt-1" />
      </div>
    </Link>
  );
}

const paginationButtonClass = cn(
  "inline-flex items-center gap-1 px-3 py-1.5 rounded-button border border-line",
  "text-ink hover:bg-cream transition-colors",
  "disabled:opacity-50 disabled:cursor-not-allowed",
);
