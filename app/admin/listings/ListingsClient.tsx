"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Filter, Search } from "lucide-react";
import { useAdminToast } from "@/components/admin/AdminToastProvider";
import { ListingRow, type ListingListItem } from "@/components/admin/ListingRow";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
  { value: "filled", label: "Filled" },
];

const ARCHIVED_OPTIONS = [
  { value: "all", label: "All archive states" },
  { value: "no", label: "Not archived" },
  { value: "yes", label: "Archived" },
];

export function ListingsClient() {
  const toast = useAdminToast();
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [status, setStatus] = useState("all");
  const [platform, setPlatform] = useState("");
  const [archived, setArchived] = useState("all");
  const [page, setPage] = useState(1);
  const [listings, setListings] = useState<ListingListItem[]>([]);
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

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        q: debouncedQ,
        status,
        archived,
        page: page.toString(),
      });
      if (platform.trim()) params.set("platform", platform.trim());

      const response = await fetch(`/admin/api/listings?${params}`);
      if (!response.ok) {
        const data = (await response
          .json()
          .catch(() => ({ error: `HTTP ${response.status}` }))) as {
          error?: string;
        };
        throw new Error(data.error ?? `HTTP ${response.status}`);
      }

      const data = (await response.json()) as {
        listings: ListingListItem[];
        total: number;
        page_size: number;
      };
      setListings(data.listings);
      setTotal(data.total);
      setPageSize(data.page_size);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to load listings.";
      setError(message);
      toast.show(message, "error");
    } finally {
      setLoading(false);
    }
  }, [archived, debouncedQ, page, platform, status, toast]);

  useEffect(() => {
    void fetchListings();
  }, [fetchListings]);

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
            placeholder="Listing title, platform, host email/name, or UUID"
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-cream-card border border-line rounded-button text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-teal-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 text-xs text-ink-muted">
            <Filter size={14} />
            Filter
          </div>
          <select
            value={status}
            onChange={(e) => handleFilterChange(setStatus)(e.target.value)}
            className="text-sm bg-cream-card border border-line rounded-button px-3 py-1.5 text-ink focus:outline-none focus:ring-2 focus:ring-teal-900"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={archived}
            onChange={(e) => handleFilterChange(setArchived)(e.target.value)}
            className="text-sm bg-cream-card border border-line rounded-button px-3 py-1.5 text-ink focus:outline-none focus:ring-2 focus:ring-teal-900"
          >
            {ARCHIVED_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={platform}
            onChange={(e) => handleFilterChange(setPlatform)(e.target.value)}
            placeholder="Platform slug"
            className="w-full sm:w-44 text-sm bg-cream-card border border-line rounded-button px-3 py-1.5 text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-teal-900"
          />
          <span className="text-xs text-ink-muted sm:ml-auto">
            {loading
              ? "Loading..."
              : `${total} listing${total === 1 ? "" : "s"}`}
          </span>
        </div>
      </div>

      {error ? (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-card p-4 text-red-900 text-sm">
          {error}
        </div>
      ) : null}

      {listings.length === 0 && !loading ? (
        <div className="border border-line rounded-card bg-cream-card p-8 text-center text-ink-muted">
          No listings match these filters.
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <ListingRow key={listing.id} listing={listing} />
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
