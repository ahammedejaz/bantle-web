"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Filter, Search } from "lucide-react";
import { AuditRow, type AuditListItem } from "@/components/admin/AuditRow";
import { useAdminToast } from "@/components/admin/AdminToastProvider";
import { cn } from "@/lib/utils";

const ACTION_OPTIONS = [
  { value: "all", label: "All actions" },
  { value: "report_resolved", label: "Report resolved" },
  { value: "report_dismissed", label: "Report dismissed" },
  { value: "user_warned", label: "User warned" },
  { value: "user_banned", label: "User banned" },
  { value: "user_soft_deleted", label: "User soft deleted" },
  { value: "user_restored", label: "User restored" },
  { value: "platform_created", label: "Platform created" },
  { value: "platform_updated", label: "Platform updated" },
  { value: "platform_deactivated", label: "Platform deactivated" },
  { value: "platform_activated", label: "Platform activated" },
  { value: "platform_deleted", label: "Platform deleted" },
  { value: "listing_closed", label: "Listing closed" },
  { value: "deal_terminated", label: "Deal terminated" },
  { value: "broadcast_sent", label: "Broadcast sent" },
  { value: "broadcast_retried", label: "Broadcast retried" },
];

const RESOURCE_OPTIONS = [
  { value: "all", label: "All resource types" },
  { value: "user", label: "User" },
  { value: "user_report", label: "Report" },
  { value: "platform", label: "Platform" },
  { value: "listing", label: "Listing" },
  { value: "deal", label: "Deal" },
];

export function AuditClient() {
  const toast = useAdminToast();
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [actionType, setActionType] = useState("all");
  const [targetResourceType, setTargetResourceType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [actions, setActions] = useState<AuditListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  const fetchAudit = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        action_type: actionType,
        target_resource_type: targetResourceType,
      });
      if (debouncedQ.trim()) params.set("q", debouncedQ.trim());
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);

      const response = await fetch(`/admin/api/audit?${params}`);
      if (!response.ok) {
        const data = (await response
          .json()
          .catch(() => ({ error: `HTTP ${response.status}` }))) as {
          error?: string;
        };
        throw new Error(data.error ?? `HTTP ${response.status}`);
      }

      const data = (await response.json()) as {
        actions: AuditListItem[];
        total: number;
        page_size: number;
      };
      setActions(data.actions);
      setTotal(data.total);
      setPageSize(data.page_size);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to load audit log.";
      setError(message);
      toast.show(message, "error");
    } finally {
      setLoading(false);
    }
  }, [
    actionType,
    dateFrom,
    dateTo,
    debouncedQ,
    page,
    targetResourceType,
    toast,
  ]);

  useEffect(() => {
    void fetchAudit();
  }, [fetchAudit]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleFilterChange = (setter: (value: string) => void) => {
    return (value: string) => {
      setter(value);
      setPage(1);
    };
  };

  return (
    <div>
      <div className="space-y-3 mb-6">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
          />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Action, reason, resource, user, or UUID"
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-cream-card border border-line rounded-button text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-teal-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 text-xs text-ink-muted">
            <Filter size={14} />
            Filter
          </div>
          <select
            value={actionType}
            onChange={(e) =>
              handleFilterChange(setActionType)(e.target.value)
            }
            className="text-sm bg-cream-card border border-line rounded-button px-3 py-1.5 text-ink focus:outline-none focus:ring-2 focus:ring-teal-900"
          >
            {ACTION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={targetResourceType}
            onChange={(e) =>
              handleFilterChange(setTargetResourceType)(e.target.value)
            }
            className="text-sm bg-cream-card border border-line rounded-button px-3 py-1.5 text-ink focus:outline-none focus:ring-2 focus:ring-teal-900"
          >
            {RESOURCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => handleFilterChange(setDateFrom)(e.target.value)}
            aria-label="Date from"
            className="text-sm bg-cream-card border border-line rounded-button px-3 py-1.5 text-ink focus:outline-none focus:ring-2 focus:ring-teal-900"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => handleFilterChange(setDateTo)(e.target.value)}
            aria-label="Date to"
            className="text-sm bg-cream-card border border-line rounded-button px-3 py-1.5 text-ink focus:outline-none focus:ring-2 focus:ring-teal-900"
          />
          <span className="text-xs text-ink-muted sm:ml-auto">
            {loading
              ? "Loading..."
              : `${total} action${total === 1 ? "" : "s"}`}
          </span>
        </div>
      </div>

      {error ? (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-card p-4 text-red-900 text-sm">
          {error}
        </div>
      ) : null}

      {actions.length === 0 && !loading ? (
        <div className="border border-line rounded-card bg-cream-card p-8 text-center text-ink-muted">
          No audit actions match these filters.
        </div>
      ) : (
        <div className="space-y-3">
          {actions.map((action) => (
            <AuditRow key={action.id} action={action} />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-between mt-6 text-sm">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={page === 1 || loading}
            className={cn(
              "inline-flex items-center gap-1 px-3 py-1.5 rounded-button border border-line",
              "text-ink hover:bg-cream transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            <ChevronLeft size={14} />
            Prev
          </button>
          <span className="text-ink-muted">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            disabled={page === totalPages || loading}
            className={cn(
              "inline-flex items-center gap-1 px-3 py-1.5 rounded-button border border-line",
              "text-ink hover:bg-cream transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
