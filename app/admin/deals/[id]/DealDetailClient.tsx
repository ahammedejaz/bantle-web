"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronLeft, ExternalLink } from "lucide-react";
import { useAdminToast } from "@/components/admin/AdminToastProvider";
import {
  DealTerminateModal,
  type DealTerminateResponse,
} from "@/components/admin/DealTerminateModal";
import { DealStatusBadge } from "@/components/admin/DealStatusBadge";
import { dealTermsSummary, dealTermsType } from "@/lib/adminTerms";

interface ProfileSummary {
  id: string;
  display_name: string | null;
  email: string | null;
  deleted_at: string | null;
  banned_until?: string | null;
  permanently_banned?: boolean | null;
  is_admin?: boolean | null;
}

interface ListingSummary {
  id: string;
  user_id: string | null;
  title: string | null;
  platform: string | null;
  category: string | null;
  listing_type?: string | null;
  monthly_price: number | null;
  status: string | null;
  archived_at: string | null;
  closed_at?: string | null;
}

interface DealDetail {
  id: string;
  listing_id: string;
  host_id: string | null;
  buyer_id: string | null;
  conversation_id: string | null;
  status: string | null;
  agreed_price: number;
  duration_months: number | null;
  started_at: string | null;
  ends_at: string | null;
  terminated_at: string | null;
  terminated_by: string | null;
  termination_reason: string | null;
  termination_source: string | null;
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
  listing: ListingSummary | null;
  host: ProfileSummary | null;
  buyer: ProfileSummary | null;
}

interface MessageRow {
  id: string;
  sender_id: string | null;
  kind: string;
  text: string;
  deal_id: string | null;
  created_at: string | null;
}

interface RatingRow {
  id: string;
  rater_id: string | null;
  rated_id: string | null;
  stars: number;
  comment: string | null;
  milestone: string;
  created_at: string | null;
}

interface AuditEntry {
  id: string;
  admin_id: string | null;
  action_type: string;
  target_user_id: string | null;
  target_resource_id: string | null;
  target_resource_type: string | null;
  reason: string | null;
  payload: Record<string, unknown> | null;
  created_at: string | null;
}

interface DisclaimerAcceptance {
  id: string;
  user_id: string | null;
  deal_id: string | null;
  listing_id: string | null;
  action: string;
  disclaimer_version: string;
  listing_type_snapshot: string;
  deal_type_snapshot: string;
  accepted_at: string | null;
}

interface DealDetailResponse {
  deal: DealDetail;
  listing: ListingSummary | null;
  host: ProfileSummary | null;
  buyer: ProfileSummary | null;
  conversation: {
    id: string;
    listing_id: string;
    host_id: string;
    buyer_id: string;
    created_at: string | null;
    last_message_at: string | null;
  } | null;
  recent_messages: MessageRow[];
  ratings: RatingRow[];
  audit_entries: AuditEntry[];
  disclaimer_acceptances: DisclaimerAcceptance[];
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
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

function profileName(profile: ProfileSummary | null | undefined): string {
  if (!profile) return "Missing profile";
  if (profile.display_name?.trim()) return profile.display_name;
  return profile.email ?? "Unnamed user";
}

export function DealDetailClient({ dealId }: { dealId: string }) {
  const toast = useAdminToast();
  const [data, setData] = useState<DealDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [terminateOpen, setTerminateOpen] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/admin/api/deals/${dealId}`);
      if (!response.ok) {
        const body = (await response
          .json()
          .catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `HTTP ${response.status}`);
      }
      const json = (await response.json()) as DealDetailResponse;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load deal.");
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  const handleTerminated = (response: DealTerminateResponse) => {
    setTerminateOpen(false);
    const summary = response.notification_summary;
    const hasWarning =
      summary.notification_failed_count > 0 ||
      summary.push_failure_count > 0 ||
      summary.message_failed_count > 0 ||
      summary.warnings.length > 0;
    toast.show(
      response.already_terminated
        ? "Deal was already terminated by Bantle."
        : hasWarning
          ? "Deal terminated. Notification, push, or chat event had warnings."
          : "Deal terminated.",
      hasWarning ? "error" : "success",
    );
    void fetchDetail();
  };

  if (loading && !data) {
    return <div className="text-ink-muted">Loading deal&hellip;</div>;
  }

  if (error || !data) {
    return (
      <div>
        <BackLink />
        <div className="bg-red-50 border border-red-200 rounded-card p-4 text-red-900 text-sm">
          {error ?? "Deal not found"}
        </div>
      </div>
    );
  }

  const { deal, listing, host, buyer, conversation, recent_messages, ratings, audit_entries } =
    data;
  const isAdminTerminated =
    deal.termination_source === "admin" && !!deal.terminated_at;
  const canTerminate = deal.status === "pending" || deal.status === "active";
  const listingTitle = listing?.title ?? "Listing unavailable";
  const oneTimeDeal = dealTermsType(deal) === "one_time";

  return (
    <div>
      <BackLink />

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <DealStatusBadge
            status={deal.status}
            terminationSource={deal.termination_source}
            terminatedAt={deal.terminated_at}
          />
          <span className="text-xs text-ink-muted">
            Created {fmtDate(deal.created_at)}
          </span>
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h1 className="font-serif italic text-3xl md:text-4xl text-teal-900 leading-[1.1]">
              {listingTitle}
            </h1>
            <p className="text-sm text-ink-muted mt-2">
              {listing?.platform ?? "Unknown platform"} ·{" "}
              {oneTimeDeal ? "One-time access" : "Monthly sharing"} ·{" "}
              {dealTermsSummary(deal)}
            </p>
            <p className="text-xs text-ink-muted mt-1 font-mono break-all">
              {deal.id}
            </p>
          </div>
          {canTerminate && !isAdminTerminated ? (
            <button
              type="button"
              onClick={() => setTerminateOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-button bg-red-700 text-cream text-sm font-medium hover:bg-red-800 transition-colors"
            >
              <AlertTriangle size={16} />
              Force-terminate
            </button>
          ) : null}
        </div>
      </div>

      {canTerminate && !isAdminTerminated ? (
        <div className="flex gap-2 rounded-card border border-amber-200 bg-amber-50 p-4 mb-6 text-amber-900">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Termination affects this deal only</p>
            <p className="text-sm mt-1">
              The listing, ratings, chat history, and unrelated deals will not
              be changed.
            </p>
          </div>
        </div>
      ) : null}

      {isAdminTerminated ? (
        <section className="mb-6 bg-red-50 border border-red-200 rounded-card p-4 text-red-900">
          <p className="text-xs uppercase tracking-[0.14em] mb-2">
            Admin termination
          </p>
          <p className="text-sm">
            Terminated {fmtDate(deal.terminated_at)} by {deal.terminated_by}
          </p>
          {deal.termination_reason ? (
            <p className="text-sm mt-2 whitespace-pre-wrap">
              {deal.termination_reason}
            </p>
          ) : null}
        </section>
      ) : null}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <CountBlock label="Status" value={deal.status ?? "unknown"} />
        <CountBlock label="Started" value={fmtDate(deal.started_at)} />
        <CountBlock label="Ends" value={fmtDate(deal.ends_at)} />
        <CountBlock label="Terminated" value={fmtDate(deal.terminated_at)} />
      </div>

      <section className="grid gap-4 md:grid-cols-3 mb-6">
        <ProfileCard label="Host" profile={host} />
        <ProfileCard label="Buyer" profile={buyer} />
        <div className="bg-cream-card border border-line rounded-card p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-2">
            Listing
          </p>
          {listing ? (
            <>
              <Link
                href={`/admin/listings/${listing.id}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-teal-800 hover:text-teal-900"
              >
                {listing.title ?? "Untitled listing"}
                <ExternalLink size={12} />
              </Link>
              <p className="text-xs text-ink-muted mt-1">
                {listing.platform ?? "Unknown platform"} ·{" "}
                {listing.listing_type === "one_time"
                  ? "One-time access"
                  : "Monthly sharing"}{" "}
                · {listing.status ?? "unknown"}
              </p>
            </>
          ) : (
            <p className="text-sm text-ink-muted">Listing missing.</p>
          )}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="font-serif italic text-2xl text-teal-900 mb-3">
          Deal disclaimer evidence
        </h2>
        {data.disclaimer_acceptances.length === 0 ? (
          <EmptyBlock>No disclaimer acceptance records found.</EmptyBlock>
        ) : (
          <div className="space-y-3">
            {data.disclaimer_acceptances.map((acceptance) => (
              <div
                key={acceptance.id}
                className="bg-cream-card border border-line rounded-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">
                      {acceptance.action} · v{acceptance.disclaimer_version}
                    </p>
                    <p className="text-xs text-ink-muted mt-1">
                      Listing: {acceptance.listing_type_snapshot} · Deal:{" "}
                      {acceptance.deal_type_snapshot}
                    </p>
                    <p className="text-xs text-ink-muted mt-1 font-mono break-all">
                      User {acceptance.user_id ?? "unknown"}
                    </p>
                  </div>
                  <p className="text-xs text-ink-muted shrink-0">
                    {fmtDate(acceptance.accepted_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-6">
        <h2 className="font-serif italic text-2xl text-teal-900 mb-3">
          Conversation
        </h2>
        {conversation ? (
          <div className="bg-cream-card border border-line rounded-card p-4">
            <p className="text-sm text-ink">
              Last message {fmtDate(conversation.last_message_at)}
            </p>
            <p className="text-xs text-ink-muted mt-1 font-mono break-all">
              {conversation.id}
            </p>
          </div>
        ) : (
          <EmptyBlock>No conversation linked to this deal.</EmptyBlock>
        )}
      </section>

      <section className="mb-6">
        <h2 className="font-serif italic text-2xl text-teal-900 mb-3">
          Recent messages
        </h2>
        {recent_messages.length === 0 ? (
          <EmptyBlock>No recent messages.</EmptyBlock>
        ) : (
          <div className="space-y-3">
            {recent_messages.map((message) => (
              <div
                key={message.id}
                className="bg-cream-card border border-line rounded-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.1em] text-teal-600">
                      {message.kind}
                    </p>
                    <p className="text-sm text-ink mt-1 whitespace-pre-wrap">
                      {message.text}
                    </p>
                  </div>
                  <p className="text-xs text-ink-muted shrink-0">
                    {fmtDate(message.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-6">
        <h2 className="font-serif italic text-2xl text-teal-900 mb-3">
          Ratings
        </h2>
        {ratings.length === 0 ? (
          <EmptyBlock>No ratings for this deal.</EmptyBlock>
        ) : (
          <div className="space-y-3">
            {ratings.map((rating) => (
              <div
                key={rating.id}
                className="bg-cream-card border border-line rounded-card p-4"
              >
                <p className="text-sm font-medium text-ink">
                  {rating.stars}/5 · {rating.milestone}
                </p>
                {rating.comment ? (
                  <p className="text-sm text-ink-muted mt-1">
                    {rating.comment}
                  </p>
                ) : null}
                <p className="text-xs text-ink-muted mt-2">
                  {fmtDate(rating.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-serif italic text-2xl text-teal-900 mb-3">
          Audit entries
        </h2>
        {audit_entries.length === 0 ? (
          <EmptyBlock>No deal audit entries.</EmptyBlock>
        ) : (
          <div className="space-y-3">
            {audit_entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-cream-card border border-line rounded-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {entry.action_type}
                    </p>
                    {entry.reason ? (
                      <p className="text-sm text-ink-muted mt-1">
                        {entry.reason}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-xs text-ink-muted shrink-0">
                    {fmtDate(entry.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <DealTerminateModal
        open={terminateOpen}
        dealId={deal.id}
        listingTitle={listingTitle}
        onOpenChange={setTerminateOpen}
        onTerminated={handleTerminated}
        onError={(message) => toast.show(message, "error")}
      />
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/admin/deals"
      className="inline-flex items-center text-sm text-teal-700 hover:text-teal-900 mb-4"
    >
      <ChevronLeft size={14} className="mr-1" /> Back to deals
    </Link>
  );
}

function CountBlock({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="p-3 rounded-card border border-line bg-cream-card">
      <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-1">
        {label}
      </p>
      <p className="text-lg font-medium text-ink">{value}</p>
    </div>
  );
}

function EmptyBlock({ children }: { children: string }) {
  return (
    <div className="border border-line rounded-card bg-cream-card p-6 text-sm text-ink-muted text-center">
      {children}
    </div>
  );
}

function ProfileCard({
  label,
  profile,
}: {
  label: "Host" | "Buyer";
  profile: ProfileSummary | null;
}) {
  return (
    <div className="bg-cream-card border border-line rounded-card p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-2">
        {label}
      </p>
      {profile ? (
        <>
          <Link
            href={`/admin/users/${profile.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-teal-800 hover:text-teal-900"
          >
            {profileName(profile)}
            <ExternalLink size={12} />
          </Link>
          <p className="text-xs text-ink-muted mt-1 truncate">
            {profile.email ?? "No email"}
          </p>
        </>
      ) : (
        <p className="text-sm text-ink-muted">Profile missing.</p>
      )}
    </div>
  );
}
