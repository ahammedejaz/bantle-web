"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
} from "lucide-react";
import { useAdminToast } from "@/components/admin/AdminToastProvider";
import { cn } from "@/lib/utils";

type ReviewStatus = "pending" | "approved" | "rejected" | "cancelled";
type StatusFilter = ReviewStatus | "all";

interface IdentityVerificationListItem {
  id: string;
  user_id: string;
  status: ReviewStatus;
  submitted_at: string;
  reviewed_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  user: {
    id: string;
    display_name: string | null;
    rating_avg: number | null;
    rating_count: number | null;
    identity_verification_status: string;
    is_verified: boolean | null;
  } | null;
}

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "pending", label: "Pending" },
  { value: "all", label: "All statuses" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

export function IdentityVerificationsClient() {
  const toast = useAdminToast();
  const [status, setStatus] = useState<StatusFilter>("pending");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<IdentityVerificationListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status,
        page: page.toString(),
      });
      const response = await fetch(
        `/admin/api/identity-verifications?${params}`,
      );
      if (!response.ok) {
        const data = (await response
          .json()
          .catch(() => ({ error: `HTTP ${response.status}` }))) as {
          error?: string;
        };
        throw new Error(data.error ?? `HTTP ${response.status}`);
      }
      const data = (await response.json()) as {
        verifications: IdentityVerificationListItem[];
        total: number;
        page_size: number;
      };
      setItems(data.verifications);
      setTotal(data.total);
      setPageSize(data.page_size);
    } catch (error) {
      toast.show(
        error instanceof Error
          ? error.message
          : "Identity requests could not be loaded.",
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
          No identity verification requests match this filter.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <IdentityVerificationRow key={item.id} item={item} />
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

function IdentityVerificationRow({
  item,
}: {
  item: IdentityVerificationListItem;
}) {
  const statusDisplay = getStatusDisplay(item.status);
  const ratingText =
    item.user?.rating_count && item.user.rating_count > 0
      ? `${(item.user.rating_avg ?? 0).toFixed(1)} from ${
          item.user.rating_count
        } rating${item.user.rating_count === 1 ? "" : "s"}`
      : "No ratings yet";

  return (
    <Link
      href={`/admin/identity-verifications/${item.id}`}
      className="block border border-line rounded-card bg-cream-card p-4 hover:border-teal-200 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-medium text-ink">
              {item.user?.display_name ?? "Unknown user"}
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
              #{shortId(item.id)}
            </span>
          </div>
          <p className="text-xs text-ink-muted">
            Identity status: {humanize(item.user?.identity_verification_status)}
            {item.user?.is_verified ? " · legacy badge currently on" : ""}
          </p>
          <p className="text-xs text-ink-muted mt-1">
            Submitted {fmtDate(item.submitted_at)} · {ratingText}
            {item.reviewed_at ? ` · reviewed ${fmtDate(item.reviewed_at)}` : ""}
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

function getStatusDisplay(status: ReviewStatus) {
  if (status === "approved") {
    return {
      label: "Approved",
      className: "bg-teal-50 text-teal-900 border-teal-200",
    };
  }
  if (status === "rejected") {
    return {
      label: "Rejected",
      className: "bg-red-50 text-red-900 border-red-200",
    };
  }
  if (status === "cancelled") {
    return {
      label: "Cancelled",
      className: "bg-gray-50 text-gray-700 border-gray-200",
    };
  }
  return {
    label: "Pending",
    className: "bg-amber-50 text-amber-900 border-amber-200",
  };
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortId(id: string): string {
  return id.slice(0, 8);
}

function humanize(value: string | null | undefined): string {
  if (!value) return "unknown";
  return value.replace(/_/g, " ");
}
