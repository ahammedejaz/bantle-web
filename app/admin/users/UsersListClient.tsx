"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useAdminToast } from "@/components/admin/AdminToastProvider";
import { UserRow } from "@/components/admin/UserRow";
import { cn } from "@/lib/utils";

interface UserListItem {
  id: string;
  display_name: string | null;
  email: string | null;
  created_at: string | null;
  is_admin: boolean;
  banned_until: string | null;
  permanently_banned: boolean;
  deleted_at: string | null;
  rating_avg: number | null;
  rating_count: number | null;
  is_verified: boolean | null;
}

export function UsersListClient() {
  const toast = useAdminToast();
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce ~300ms so typing doesn't fire a fetch per keystroke.
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

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: debouncedQ,
        page: page.toString(),
      });
      const response = await fetch(`/admin/api/users?${params}`);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}`);
      }
      const data = (await response.json()) as {
        users: UserListItem[];
        total: number;
        page_size: number;
      };
      setUsers(data.users);
      setTotal(data.total);
      setPageSize(data.page_size);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load users.";
      toast.show(message, "error");
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, page, toast]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
        />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Email, name, or UUID"
          className="w-full pl-9 pr-3 py-2.5 text-sm bg-cream-card border border-line rounded-button text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-teal-900"
        />
      </div>

      <div className="flex items-center justify-between mb-4 text-xs">
        <span className="text-ink-muted">
          {loading ? "Loading…" : `${total} user${total === 1 ? "" : "s"}`}
        </span>
      </div>

      {users.length === 0 && !loading ? (
        <div className="border border-line rounded-card bg-cream-card p-8 text-center text-ink-muted">
          {debouncedQ
            ? "No users match this search."
            : "No users to display."}
        </div>
      ) : (
        <div>
          {users.map((user) => (
            <UserRow key={user.id} user={user} />
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
