"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Megaphone,
  RefreshCw,
  Send,
} from "lucide-react";
import { useAdminToast } from "@/components/admin/AdminToastProvider";
import { cn } from "@/lib/utils";

const CONFIRMATION_TEXT = "SEND INCIDENT BROADCAST";

type AudienceType = "test_syed" | "all_eligible";

type BroadcastItem = {
  id: string;
  title: string;
  body: string;
  reason: string;
  audience_type: string;
  status: string;
  recipient_count: number;
  push_success_count: number;
  push_failure_count: number;
  push_skipped_count: number;
  notification_inserted_count: number;
  notification_failed_count: number;
  sent_at: string | null;
  created_at: string;
  completed_at: string | null;
  error_summary: unknown;
  admin: {
    id: string;
    display_name: string | null;
    email: string | null;
  } | null;
};

type BroadcastPreview = {
  audience_type: AudienceType;
  recipient_count: number;
  push_token_count: number;
  no_push_token_count: number;
  excluded_deleted_or_banned_count: number;
};

export function BroadcastsClient() {
  const toast = useAdminToast();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [reason, setReason] = useState("");
  const [audienceType, setAudienceType] = useState<AudienceType>("all_eligible");
  const [preview, setPreview] = useState<BroadcastPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const attemptKeyRef = useRef<string | null>(null);

  const titleLength = title.trim().length;
  const bodyLength = body.trim().length;
  const reasonLength = reason.trim().length;
  const formError = useMemo(
    () => validateForm(title, body, reason),
    [body, reason, title],
  );

  const fetchBroadcasts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString() });
      const response = await fetch(`/admin/api/broadcasts?${params}`);
      if (!response.ok) {
        const data = (await response
          .json()
          .catch(() => ({ error: `HTTP ${response.status}` }))) as {
          error?: string;
        };
        throw new Error(data.error ?? `HTTP ${response.status}`);
      }
      const data = (await response.json()) as {
        broadcasts: BroadcastItem[];
        total: number;
        page_size: number;
      };
      setBroadcasts(data.broadcasts);
      setTotal(data.total);
      setPageSize(data.page_size);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to load broadcasts.";
      toast.show(message, "error");
    } finally {
      setLoading(false);
    }
  }, [page, toast]);

  const fetchPreview = useCallback(async () => {
    setPreviewLoading(true);
    try {
      const params = new URLSearchParams({ audience_type: audienceType });
      const response = await fetch(`/admin/api/broadcasts/preview?${params}`);
      if (!response.ok) {
        const data = (await response
          .json()
          .catch(() => ({ error: `HTTP ${response.status}` }))) as {
          error?: string;
        };
        throw new Error(data.error ?? `HTTP ${response.status}`);
      }
      const data = (await response.json()) as BroadcastPreview;
      setPreview(data);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to preview recipients.";
      toast.show(message, "error");
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  }, [audienceType, toast]);

  useEffect(() => {
    void fetchBroadcasts();
  }, [fetchBroadcasts]);

  useEffect(() => {
    void fetchPreview();
  }, [fetchPreview]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canOpenConfirm =
    !formError &&
    !!preview &&
    !previewLoading &&
    !submitting;

  const openConfirm = () => {
    if (!canOpenConfirm) return;
    attemptKeyRef.current = makeIdempotencyKey();
    setConfirmText("");
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (submitting) return;
    setConfirmOpen(false);
    setConfirmText("");
    attemptKeyRef.current = null;
  };

  const sendBroadcast = async () => {
    if (confirmText !== CONFIRMATION_TEXT || !attemptKeyRef.current) return;
    setSubmitting(true);
    try {
      const response = await fetch("/admin/api/broadcasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          reason: reason.trim(),
          audience_type: audienceType,
          confirmation_text: confirmText,
          idempotency_key: attemptKeyRef.current,
        }),
      });
      const data = (await response
        .json()
        .catch(() => ({ error: `HTTP ${response.status}` }))) as {
        error?: string;
        broadcast?: BroadcastItem;
      };
      if (!response.ok) {
        throw new Error(data.error ?? `HTTP ${response.status}`);
      }

      const broadcast = data.broadcast;
      if (
        broadcast?.status === "partial_failure" ||
        (broadcast?.push_failure_count ?? 0) > 0 ||
        (broadcast?.notification_failed_count ?? 0) > 0
      ) {
        toast.show("Broadcast sent with warnings. Review the summary.", "warning");
      } else {
        toast.show("Broadcast completed.", "success");
      }
      setTitle("");
      setBody("");
      setReason("");
      setConfirmOpen(false);
      setConfirmText("");
      attemptKeyRef.current = null;
      await fetchBroadcasts();
      await fetchPreview();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to send broadcast.";
      toast.show(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const retryBroadcast = async (broadcast: BroadcastItem) => {
    if (retryingId) return;
    setRetryingId(broadcast.id);
    try {
      const response = await fetch(
        `/admin/api/broadcasts/${broadcast.id}/retry`,
        { method: "POST" },
      );
      const data = (await response
        .json()
        .catch(() => ({ error: `HTTP ${response.status}` }))) as {
        error?: string;
        broadcast?: BroadcastItem;
      };
      if (!response.ok) {
        throw new Error(data.error ?? `HTTP ${response.status}`);
      }

      const retried = data.broadcast;
      if (
        retried?.status === "partial_failure" ||
        (retried?.push_failure_count ?? 0) > 0 ||
        (retried?.notification_failed_count ?? 0) > 0
      ) {
        toast.show("Retry completed with warnings. Review the summary.", "warning");
      } else {
        toast.show("Broadcast delivery retried.", "success");
      }
      await fetchBroadcasts();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to retry broadcast.";
      toast.show(message, "error");
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-amber-200 bg-amber-50 p-4">
        <div className="flex gap-3">
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0 text-amber-800"
          />
          <p className="text-sm text-amber-950">
            Broadcasts are for incidents only - service outages, security
            notices. Do not use for marketing or re-engagement.
          </p>
        </div>
      </section>

      <section className="rounded-card border border-line bg-cream-card p-4 md:p-5">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone size={18} className="text-teal-800" />
          <h2 className="text-lg font-semibold text-ink">New incident notice</h2>
        </div>

        <div className="space-y-4">
          <Field label="Title" count={`${titleLength}/80`}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bantle service notice"
              className="w-full rounded-button border border-line bg-cream px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-teal-900"
            />
          </Field>

          <Field label="Body" count={`${bodyLength}/240`}>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="Short incident update. No marketing or links."
              className="w-full rounded-button border border-line bg-cream px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-teal-900"
            />
          </Field>

          <Field
            label="Admin-only audit reason"
            count={`${reasonLength}/500`}
          >
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Why this incident broadcast is necessary"
              className="w-full rounded-button border border-line bg-cream px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-teal-900"
            />
          </Field>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <Field label="Audience">
              <select
                value={audienceType}
                onChange={(e) => setAudienceType(e.target.value as AudienceType)}
                className="w-full rounded-button border border-line bg-cream px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal-900"
              >
                <option value="all_eligible">All eligible users</option>
                <option value="test_syed">Test only: Syed</option>
              </select>
            </Field>
            <button
              type="button"
              onClick={() => void fetchPreview()}
              disabled={previewLoading}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-button border border-line px-3 py-2 text-sm font-medium text-ink",
                "hover:bg-cream transition-colors disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              <RefreshCw size={14} className={previewLoading ? "animate-spin" : ""} />
              Refresh count
            </button>
          </div>

          <AudienceNotice audienceType={audienceType} />

          <PreviewPanel preview={preview} loading={previewLoading} />

          {formError ? (
            <p className="text-sm text-red-800">{formError}</p>
          ) : null}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={openConfirm}
              disabled={!canOpenConfirm}
              className={cn(
                "inline-flex items-center gap-2 rounded-button bg-teal-900 px-4 py-2 text-sm font-medium text-cream",
                "hover:bg-teal-800 transition-colors disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              <Send size={15} />
              Review and send
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-ink">Recent broadcasts</h2>
          <span className="text-xs text-ink-muted">
            {loading
              ? "Loading..."
              : `${total} broadcast${total === 1 ? "" : "s"}`}
          </span>
        </div>

        {broadcasts.length === 0 && !loading ? (
          <div className="rounded-card border border-line bg-cream-card p-8 text-center text-ink-muted">
            No incident broadcasts have been sent yet.
          </div>
        ) : (
          <div className="space-y-3">
            {broadcasts.map((broadcast) => (
              <BroadcastRow
                key={broadcast.id}
                broadcast={broadcast}
                expanded={!!expanded[broadcast.id]}
                retrying={retryingId === broadcast.id}
                onRetry={() => void retryBroadcast(broadcast)}
                onToggle={() =>
                  setExpanded((current) => ({
                    ...current,
                    [broadcast.id]: !current[broadcast.id],
                  }))
                }
              />
            ))}
          </div>
        )}

        {totalPages > 1 ? (
          <div className="flex items-center justify-between mt-6 text-sm">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={page === 1 || loading}
              className="inline-flex items-center gap-1 rounded-button border border-line px-3 py-1.5 text-ink hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
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
              className="inline-flex items-center gap-1 rounded-button border border-line px-3 py-1.5 text-ink hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        ) : null}
      </section>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-card border border-line bg-cream-card p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={20}
                className="mt-0.5 shrink-0 text-red-800"
              />
              <div>
                <h2 className="text-lg font-semibold text-ink">
                  Send to {preview?.recipient_count ?? 0} users?
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  This action is irreversible.
                </p>
              </div>
            </div>

            {audienceType === "all_eligible" ? (
              <div className="mt-4 rounded-button border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                This will contact every eligible Bantle user. Do not continue
                unless this is a genuine incident, service, or security notice.
              </div>
            ) : null}

            <div className="mt-4 rounded-button border border-line bg-cream p-3">
              <p className="text-sm font-medium text-ink">{title.trim()}</p>
              <p className="mt-1 text-sm text-ink-muted">{body.trim()}</p>
            </div>

            <label className="mt-4 block">
              <span className="text-xs uppercase tracking-[0.14em] text-teal-700">
                Type confirmation phrase
              </span>
              <input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={CONFIRMATION_TEXT}
                className="mt-1 w-full rounded-button border border-line bg-cream px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-teal-900"
              />
            </label>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeConfirm}
                disabled={submitting}
                className="rounded-button border border-line px-3 py-2 text-sm font-medium text-ink hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void sendBroadcast()}
                disabled={confirmText !== CONFIRMATION_TEXT || submitting}
                className="inline-flex items-center gap-2 rounded-button bg-red-800 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={14} />
                {submitting ? "Sending..." : "Send broadcast"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  count,
  children,
}: {
  label: string;
  count?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.14em] text-teal-700">
        <span>{label}</span>
        {count ? <span className="text-ink-muted">{count}</span> : null}
      </span>
      {children}
    </label>
  );
}

function PreviewPanel({
  preview,
  loading,
}: {
  preview: BroadcastPreview | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="rounded-card border border-line bg-cream p-4 text-sm text-ink-muted">
        Previewing recipients...
      </div>
    );
  }
  if (!preview) {
    return (
      <div className="rounded-card border border-line bg-cream p-4 text-sm text-ink-muted">
        Recipient preview unavailable.
      </div>
    );
  }

  return (
    <div className="rounded-card border border-line bg-cream p-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <Metric label="Recipients" value={preview.recipient_count} />
        <Metric label="With push token" value={preview.push_token_count} />
        <Metric label="In-app only" value={preview.no_push_token_count} />
        <Metric
          label="Excluded"
          value={preview.excluded_deleted_or_banned_count}
        />
      </div>
      <p className="mt-3 text-xs text-ink-muted">
        Preview counts are recomputed before sending.
      </p>
    </div>
  );
}

function AudienceNotice({ audienceType }: { audienceType: AudienceType }) {
  if (audienceType === "all_eligible") {
    return (
      <div className="rounded-card border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
        All eligible users will receive an in-app notification. Users with push
        tokens will also receive a push.
      </div>
    );
  }

  return (
    <div className="rounded-card border border-line bg-cream p-3 text-sm text-ink-muted">
      Test-only mode sends to Syed for smoke verification. Use All eligible
      users for real incident updates.
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.14em] text-teal-700">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function BroadcastRow({
  broadcast,
  expanded,
  retrying,
  onRetry,
  onToggle,
}: {
  broadcast: BroadcastItem;
  expanded: boolean;
  retrying: boolean;
  onRetry: () => void;
  onToggle: () => void;
}) {
  const canRetry =
    broadcast.status === "failed" || broadcast.status === "partial_failure";

  return (
    <article className="rounded-card border border-line bg-cream-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <BroadcastStatusBadge status={broadcast.status} />
        <span className="rounded-button border border-line bg-cream px-2 py-0.5 text-xs font-medium text-ink-muted">
          {formatAudience(broadcast.audience_type)}
        </span>
        <span className="ml-auto text-xs text-ink-muted">
          {fmtDateTime(broadcast.sent_at ?? broadcast.created_at)}
        </span>
      </div>
      <div className="mt-3">
        <h3 className="text-base font-semibold text-ink">{broadcast.title}</h3>
        <p className="mt-1 text-sm text-ink-muted">{broadcast.body}</p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Metric label="Recipients" value={broadcast.recipient_count} />
        <Metric
          label="Notif ok"
          value={broadcast.notification_inserted_count}
        />
        <Metric
          label="Notif fail"
          value={broadcast.notification_failed_count}
        />
        <Metric label="Push ok" value={broadcast.push_success_count} />
        <Metric label="Push skip" value={broadcast.push_skipped_count} />
        <Metric label="Push fail" value={broadcast.push_failure_count} />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.14em] text-teal-700">
            Admin
          </p>
          <p className="truncate text-sm text-ink">
            {broadcast.admin?.display_name ?? broadcast.admin?.email ?? "Admin"}
          </p>
          {broadcast.admin?.email ? (
            <p className="truncate text-xs text-ink-muted">
              {broadcast.admin.email}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {canRetry ? (
            <button
              type="button"
              onClick={onRetry}
              disabled={retrying}
              title="Retries delivery for recipients that failed or missed in-app notification. It does not create a new broadcast."
              className="inline-flex items-center gap-1 rounded-button border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-900 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={13}
                className={retrying ? "animate-spin" : ""}
              />
              {retrying ? "Retrying..." : "Retry failed delivery"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-900"
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {expanded ? "Hide details" : "Show details"}
          </button>
        </div>
      </div>
      {expanded ? (
        <div className="mt-3 space-y-3">
          {canRetry ? (
            <div className="rounded-button border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
              Retries delivery for recipients that failed or missed in-app
              notification. It does not create a new broadcast.
            </div>
          ) : null}
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-teal-700">
              Reason
            </p>
            <p className="mt-1 text-sm text-ink">{broadcast.reason}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-teal-700">
              Error summary
            </p>
            <pre className="mt-1 max-h-48 overflow-auto rounded-button border border-line bg-cream p-3 text-[11px] text-ink-muted">
              {safeStringify(broadcast.error_summary)}
            </pre>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function BroadcastStatusBadge({ status }: { status: string }) {
  const display =
    status === "completed"
      ? "bg-teal-50 text-teal-900 border-teal-200"
      : status === "partial_failure"
        ? "bg-amber-50 text-amber-900 border-amber-200"
        : status === "failed"
          ? "bg-red-50 text-red-900 border-red-200"
          : "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <span
      className={cn(
        "rounded-button border px-2 py-0.5 text-xs font-medium",
        display,
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

function validateForm(title: string, body: string, reason: string): string | null {
  const t = title.trim();
  const b = body.trim();
  const r = reason.trim();
  if (t.length > 0 && (t.length < 5 || t.length > 80)) {
    return "Title must be 5-80 characters.";
  }
  if (b.length > 0 && (b.length < 10 || b.length > 240)) {
    return "Body must be 10-240 characters.";
  }
  if (r.length > 0 && (r.length < 10 || r.length > 500)) {
    return "Reason must be 10-500 characters.";
  }
  if (!t || !b || !r) return "Title, body, and reason are required.";
  if (/[\r\n]/.test(t) || /[\r\n]/.test(b)) {
    return "Title and body must be single-line incident notices.";
  }
  return null;
}

function makeIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const value = Math.floor(Math.random() * 16);
    const nibble = char === "x" ? value : (value & 0x3) | 0x8;
    return nibble.toString(16);
  });
}

function formatAudience(audience: string): string {
  if (audience === "test_syed") return "Test: Syed only";
  if (audience === "all_eligible") return "All eligible";
  return audience || "Unknown audience";
}

function fmtDateTime(iso: string | null): string {
  if (!iso) return "Not set";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value ?? [], null, 2);
  } catch {
    return String(value);
  }
}
