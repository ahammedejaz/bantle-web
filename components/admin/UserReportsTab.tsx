"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminToast } from "./AdminToastProvider";
import { getStatusDisplay } from "./reportStatus";
import { cn } from "@/lib/utils";

interface ReportFiledRow {
  id: string;
  category: string;
  details: string | null;
  status: string;
  resolution_action: string | null;
  created_at: string;
  resolved_at: string | null;
  reported: { display_name: string | null } | null;
}

interface ReportReceivedRow {
  id: string;
  category: string;
  details: string | null;
  status: string;
  resolution_action: string | null;
  created_at: string;
  resolved_at: string | null;
  reporter: { display_name: string | null } | null;
}

function categoryLabel(c: string): string {
  switch (c) {
    case "spam_scam":
      return "Spam / scam";
    case "personal_info":
      return "Personal info";
    case "harassment":
      return "Harassment";
    case "fake_profile":
      return "Fake profile";
    case "illegal":
      return "Illegal content";
    default:
      return c;
  }
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function counterpartyDisplayName(name: string | null | undefined): string {
  if (name && name.trim()) return name;
  return "Unnamed user";
}

export function UserReportsTab({ userId }: { userId: string }) {
  const toast = useAdminToast();
  const [filed, setFiled] = useState<ReportFiledRow[]>([]);
  const [received, setReceived] = useState<ReportReceivedRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/admin/api/users/${userId}/reports`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as {
          reports_filed: ReportFiledRow[];
          reports_received: ReportReceivedRow[];
        };
        if (cancelled) return;
        setFiled(data.reports_filed);
        setReceived(data.reports_received);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Failed to load reports.";
        toast.show(message, "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [userId, toast]);

  if (loading) {
    return <div className="text-sm text-ink-muted">Loading reports&hellip;</div>;
  }

  if (filed.length === 0 && received.length === 0) {
    return (
      <div className="border border-line rounded-card bg-cream-card p-6 text-sm text-ink-muted text-center">
        No reports.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-3">
          Reports filed by this user ({filed.length})
        </h3>
        {filed.length === 0 ? (
          <p className="text-sm text-ink-muted">None.</p>
        ) : (
          <ul className="divide-y divide-line border border-line rounded-card bg-cream-card">
            {filed.map((r) => {
              const status = getStatusDisplay(r.status);
              return (
                <li key={r.id}>
                  <Link
                    href={`/admin/reports/${r.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-cream transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink truncate">
                        {categoryLabel(r.category)} · against{" "}
                        {counterpartyDisplayName(r.reported?.display_name)}
                      </p>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {fmtDate(r.created_at)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-button border shrink-0",
                        status.className,
                      )}
                    >
                      {status.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h3 className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-3">
          Reports filed against this user ({received.length})
        </h3>
        {received.length === 0 ? (
          <p className="text-sm text-ink-muted">None.</p>
        ) : (
          <ul className="divide-y divide-line border border-line rounded-card bg-cream-card">
            {received.map((r) => {
              const status = getStatusDisplay(r.status);
              return (
                <li key={r.id}>
                  <Link
                    href={`/admin/reports/${r.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-cream transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink truncate">
                        {categoryLabel(r.category)} · by{" "}
                        {counterpartyDisplayName(r.reporter?.display_name)}
                      </p>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {fmtDate(r.created_at)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-button border shrink-0",
                        status.className,
                      )}
                    >
                      {status.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
