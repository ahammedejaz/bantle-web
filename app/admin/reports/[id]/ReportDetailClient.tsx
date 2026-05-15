"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminToast } from "@/components/admin/AdminToastProvider";
import {
  ReportActionModal,
  type ReportAction,
} from "@/components/admin/ReportActionModal";
import {
  getResolutionLabel,
  getStatusDisplay,
  isStatusOpen,
} from "@/components/admin/reportStatus";
import { cn } from "@/lib/utils";

interface ReportDetailUser {
  id: string;
  display_name: string | null;
  email: string | null;
  banned_until?: string | null;
  banned_reason?: string | null;
  deleted_at?: string | null;
  created_at: string | null;
}

interface ConversationMessage {
  id: string;
  text: string;
  kind: string;
  created_at: string;
  sender_id: string | null;
  sender: { display_name: string | null } | null;
}

interface OtherReport {
  id: string;
  category: string;
  status: string;
  resolution_action: string | null;
  created_at: string;
}

interface ReportDetailData {
  report: {
    id: string;
    category: string;
    details: string | null;
    conversation_id: string | null;
    message_id: string | null;
    created_at: string;
    status: string;
    resolved_at: string | null;
    resolution_action: string | null;
    reporter: ReportDetailUser | null;
    reported: ReportDetailUser | null;
  };
  conversation_messages: ConversationMessage[];
  other_reports_against_reported: OtherReport[];
}

interface ReportDetailClientProps {
  reportId: string;
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ReportDetailClient({ reportId }: ReportDetailClientProps) {
  const router = useRouter();
  const toast = useAdminToast();
  const [data, setData] = useState<ReportDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<ReportAction | null>(null);
  const [showMessages, setShowMessages] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/admin/api/reports/${reportId}`);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}`);
      }
      const json = (await response.json()) as ReportDetailData;
      setData(json);
      setError(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load report.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  if (loading) {
    return <div className="text-ink-muted">Loading report&hellip;</div>;
  }
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-card p-4 text-red-900 text-sm">
        {error}
      </div>
    );
  }
  if (!data) return null;

  const { report, conversation_messages: messages, other_reports_against_reported: others } = data;
  const statusDisplay = getStatusDisplay(report.status);
  const resolutionLabel = getResolutionLabel(report.resolution_action);
  const reportedBanned =
    report.reported?.banned_until &&
    new Date(report.reported.banned_until).getTime() > Date.now();
  const reportedDeleted = !!report.reported?.deleted_at;
  const isOpen = isStatusOpen(report.status);

  const handleSuccess = (message: string) => {
    toast.show(message, "success");
    setActiveAction(null);
    router.push("/admin/reports");
    router.refresh();
  };

  const handleError = (message: string) => {
    toast.show(message, "error");
    // If the report was already triaged (409 from API), pull fresh
    // state so the action buttons disappear and the "Already
    // triaged" notice replaces them.
    if (message.toLowerCase().includes("already triaged")) {
      setActiveAction(null);
      void fetchDetail();
    }
  };

  return (
    <div>
      {/* Report header */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs border",
            statusDisplay.className,
          )}
        >
          {statusDisplay.label}
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-teal-50 text-teal-900 border border-teal-200">
          {report.category}
        </span>
        <span className="text-xs text-ink-muted">
          Filed {fmtDate(report.created_at)}
        </span>
        {report.resolved_at ? (
          <span className="text-xs text-ink-muted ml-2">
            · resolved {fmtDate(report.resolved_at)}
            {resolutionLabel ? ` (${resolutionLabel})` : ""}
          </span>
        ) : null}
      </div>
      <h2 className="font-serif italic text-2xl md:text-3xl text-teal-900 leading-[1.1]">
        Report #{report.id.slice(0, 8)}
      </h2>

      {/* Details */}
      {report.details ? (
        <section className="mt-6 bg-cream-card border border-line rounded-card p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-2">
            Reporter notes
          </p>
          <p className="text-sm text-ink whitespace-pre-wrap">
            {report.details}
          </p>
        </section>
      ) : null}

      {/* Parties */}
      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="bg-cream-card border border-line rounded-card p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-2">
            Reporter
          </p>
          <p className="text-sm font-medium text-ink">
            {report.reporter?.display_name ?? "(deleted)"}
          </p>
          <p className="text-xs text-ink-muted truncate">
            {report.reporter?.email ?? "—"}
          </p>
          <p className="text-xs text-ink-muted mt-2">
            Joined {fmtDate(report.reporter?.created_at)}
          </p>
        </div>
        <div className="bg-cream-card border border-line rounded-card p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-2">
            Reported
          </p>
          <p className="text-sm font-medium text-ink">
            {report.reported?.display_name ?? "(deleted)"}
          </p>
          <p className="text-xs text-ink-muted truncate">
            {report.reported?.email ?? "—"}
          </p>
          <p className="text-xs text-ink-muted mt-2">
            Joined {fmtDate(report.reported?.created_at)}
          </p>
          {reportedDeleted ? (
            <p className="text-xs text-red-700 mt-2">
              Account soft-deleted {fmtDate(report.reported?.deleted_at)}
            </p>
          ) : reportedBanned ? (
            <p className="text-xs text-amber-700 mt-2">
              Banned until {fmtDate(report.reported?.banned_until)}
              {report.reported?.banned_reason
                ? ` — ${report.reported.banned_reason}`
                : ""}
            </p>
          ) : null}
        </div>
      </section>

      {/* Other reports against the same user */}
      {others.length > 0 ? (
        <section className="mt-6 bg-cream-card border border-line rounded-card p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-2">
            Other reports against this user ({others.length})
          </p>
          <ul className="text-sm divide-y divide-line">
            {others.map((o) => {
              const otherDisplay = getStatusDisplay(o.status);
              return (
                <li key={o.id} className="py-2 flex items-center gap-3">
                  <span className="text-xs text-ink-muted w-32 shrink-0">
                    {fmtDate(o.created_at)}
                  </span>
                  <span className="text-ink truncate flex-1">{o.category}</span>
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-button border text-xs font-medium",
                      otherDisplay.className,
                    )}
                  >
                    {otherDisplay.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* Conversation messages */}
      {report.conversation_id ? (
        <section className="mt-6 bg-cream-card border border-line rounded-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-[0.14em] text-teal-600">
              Conversation context ({messages.length})
            </p>
            <button
              type="button"
              onClick={() => setShowMessages((s) => !s)}
              className="text-xs text-teal-600 hover:text-teal-900"
            >
              {showMessages ? "Hide" : "Show"}
            </button>
          </div>
          {showMessages ? (
            <div className="space-y-2 mt-2 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-sm text-ink-muted">No messages.</p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className="text-sm border border-line rounded-button p-2"
                  >
                    <p className="text-xs text-ink-muted mb-1">
                      {m.sender?.display_name ?? "(deleted)"} ·{" "}
                      {fmtDate(m.created_at)}
                      {m.kind !== "text" ? ` · ${m.kind}` : ""}
                    </p>
                    <p className="text-ink whitespace-pre-wrap">{m.text}</p>
                  </div>
                ))
              )}
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Action panel */}
      <section className="mt-8 pt-8 border-t border-line">
        <h2 className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-4">
          Actions
        </h2>

        {isOpen ? (
          <div className="space-y-3">
            <p className="text-sm text-ink-muted mb-4">
              Choose one action below. Warn and Ban require a reason.
              Resolve and Dismiss are silent &mdash; the reporter is not
              notified.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setActiveAction("resolve")}
                className="px-4 py-3 rounded-button border border-line bg-white hover:bg-cream text-sm font-medium text-ink transition-colors"
              >
                Resolve (no action)
              </button>
              <button
                type="button"
                onClick={() => setActiveAction("dismiss")}
                className="px-4 py-3 rounded-button border border-line bg-white hover:bg-cream text-sm font-medium text-ink transition-colors"
              >
                Dismiss (bad-faith report)
              </button>
              <button
                type="button"
                onClick={() => setActiveAction("warn")}
                className="px-4 py-3 rounded-button bg-amber-50 border border-amber-200 hover:bg-amber-100 text-sm font-medium text-amber-900 transition-colors"
              >
                Warn user
              </button>
              <button
                type="button"
                onClick={() => setActiveAction("ban_temp")}
                disabled={reportedDeleted}
                className="px-4 py-3 rounded-button bg-red-50 border border-red-200 hover:bg-red-100 text-sm font-medium text-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ban 7 days
              </button>
              <button
                type="button"
                onClick={() => setActiveAction("ban_perm")}
                disabled={reportedDeleted}
                className="px-4 py-3 rounded-button bg-red-900 hover:bg-red-800 text-sm font-medium text-cream transition-colors disabled:opacity-50 disabled:cursor-not-allowed sm:col-span-2"
              >
                Ban permanently
              </button>
            </div>
            {reportedDeleted ? (
              <p className="text-xs text-ink-muted mt-2">
                Ban actions are disabled because the reported user&apos;s account is already soft-deleted.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="px-4 py-3 rounded-card border border-line bg-cream-card">
            <p className="text-sm font-medium text-ink">Already triaged</p>
            <p className="text-xs text-ink-muted mt-1">
              Status: {statusDisplay.label}
              {resolutionLabel ? ` • ${resolutionLabel}` : ""}
            </p>
            {report.resolved_at ? (
              <p className="text-xs text-ink-muted mt-0.5">
                Resolved {fmtDate(report.resolved_at)}
              </p>
            ) : null}
          </div>
        )}
      </section>

      <ReportActionModal
        reportId={reportId}
        action={activeAction}
        onClose={() => setActiveAction(null)}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </div>
  );
}
