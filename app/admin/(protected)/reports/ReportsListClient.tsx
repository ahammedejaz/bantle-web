"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { useAdminToast } from "@/components/admin/AdminToastProvider";
import { ReportRow, type ReportListItem } from "@/components/admin/ReportRow";
import { STATUS_FILTER_OPTIONS } from "@/components/admin/reportStatus";
import { cn } from "@/lib/utils";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All categories" },
  { value: "spam_scam", label: "Spam / scam" },
  { value: "personal_info", label: "Personal info" },
  { value: "harassment", label: "Harassment" },
  { value: "fake_profile", label: "Fake profile" },
  { value: "illegal", label: "Illegal content" },
];

export function ReportsListClient() {
  const toast = useAdminToast();
  const [status, setStatus] = useState("pending");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status,
        category,
        page: page.toString(),
      });
      const response = await fetch(`/admin/api/reports?${params}`);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}`);
      }
      const data = (await response.json()) as {
        reports: ReportListItem[];
        total: number;
        page_size: number;
      };
      setReports(data.reports);
      setTotal(data.total);
      setPageSize(data.page_size);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load reports.";
      toast.show(message, "error");
    } finally {
      setLoading(false);
    }
  }, [status, category, page, toast]);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    // Reset to page 1 when filters change.
    setPage(1);
  }, [status, category]);

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
          onChange={(e) => setStatus(e.target.value)}
          className="text-sm bg-cream-card border border-line rounded-button px-3 py-1.5 text-ink focus:outline-none focus:ring-2 focus:ring-teal-900"
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="text-sm bg-cream-card border border-line rounded-button px-3 py-1.5 text-ink focus:outline-none focus:ring-2 focus:ring-teal-900"
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-ink-muted ml-auto">
          {loading ? "Loading…" : `${total} result${total === 1 ? "" : "s"}`}
        </span>
      </div>

      {reports.length === 0 && !loading ? (
        <div className="border border-line rounded-card bg-cream-card p-8 text-center text-ink-muted">
          No reports match these filters.
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <ReportRow key={report.id} report={report} />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-between mt-6 text-sm">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
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
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
