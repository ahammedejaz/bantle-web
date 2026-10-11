"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  getUserDisplayName,
  getUserStatus,
  getUserStatusDisplay,
} from "@/components/admin/userStatus";
import { UserActionPanel } from "@/components/admin/UserActionPanel";
import { UserDetailTabs } from "@/components/admin/UserDetailTabs";
import {
  getEffectiveManualVerificationStatus,
  type ManualVerificationStatus,
} from "@/lib/manual-verification";

interface UserDetail {
  user: {
    id: string;
    display_name: string | null;
    email: string | null;
    created_at: string | null;
    last_seen_at: string | null;
    is_admin: boolean;
    is_verified: boolean | null;
    identity_verification_status: string;
    identity_verified_at: string | null;
    identity_verification_rejected_at: string | null;
    identity_reverification_required_at: string | null;
    manual_verification_status: ManualVerificationStatus;
    manual_verification_category:
      | "individual_exception"
      | "company"
      | "vendor"
      | "partner"
      | "other"
      | null;
    manual_verified_at: string | null;
    manual_verification_revoked_at: string | null;
    manual_verification_expires_at: string | null;
    rating_avg: number | null;
    rating_count: number | null;
    verification_override: "verified" | "unverified" | null;
    verified_manually_at: string | null;
    banned_until: string | null;
    banned_reason: string | null;
    banned_by: string | null;
    permanently_banned: boolean;
    deleted_at: string | null;
    age_attested: boolean;
    analytics_consent: boolean;
    bio: string | null;
    avatar_url: string | null;
  };
  counts: {
    listings_total: number;
    listings_active: number;
    deals_as_host: number;
    deals_as_buyer: number;
    reports_filed: number;
    reports_received: number;
  };
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function humanizeStatus(status: string): string {
  switch (status) {
    case "approved":
      return "Approved";
    case "pending":
      return "Pending";
    case "rejected":
      return "Rejected";
    case "reverification_required":
      return "Reverification required";
    case "unverified":
      return "Unverified";
    case "none":
      return "None";
    case "revoked":
      return "Revoked";
    case "expired":
      return "Expired";
    default:
      return status
        .split("_")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
  }
}

function manualReviewSummary(user: UserDetail["user"]): string {
  const effectiveStatus = getEffectiveManualVerificationStatus(user);
  const base =
    effectiveStatus === "expired" &&
    user.manual_verification_status === "approved"
      ? "Expired (inactive)"
      : humanizeStatus(effectiveStatus);
  if (
    effectiveStatus === "approved" &&
    user.manual_verification_category
  ) {
    return `${base} (${humanizeStatus(user.manual_verification_category)})`;
  }
  return base;
}

export function UserDetailClient({ userId }: { userId: string }) {
  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/admin/api/users/${userId}`);
      if (!res.ok) {
        const body = (await res
          .json()
          .catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? `Server error ${res.status}`);
        return;
      }
      const json = (await res.json()) as UserDetail;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  if (loading && !data) {
    return <div className="text-ink-muted">Loading user&hellip;</div>;
  }
  if (error || !data) {
    return (
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center text-sm text-teal-700 hover:text-teal-900 mb-4"
        >
          <ChevronLeft size={14} className="mr-1" /> Back to users
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-card p-4 text-red-900 text-sm">
          {error ?? "User not found"}
        </div>
      </div>
    );
  }

  const { user, counts } = data;
  const name = getUserDisplayName(user);
  const status = getUserStatus(user);
  const statusDisplay = getUserStatusDisplay(status);

  return (
    <div>
      <Link
        href="/admin/users"
        className="inline-flex items-center text-sm text-teal-700 hover:text-teal-900 mb-4"
      >
        <ChevronLeft size={14} className="mr-1" /> Back to users
      </Link>

      {/* Identity block */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h1 className="font-serif italic text-3xl md:text-4xl text-teal-900 leading-[1.1]">
            {name}
          </h1>
          <span
            className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-button border ${statusDisplay.className}`}
          >
            {statusDisplay.label}
          </span>
          {user.is_verified ? (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-button border bg-teal-50 text-teal-900 border-teal-200">
              Public badge: On
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-button border bg-gray-50 text-gray-700 border-gray-200">
              Public badge: Off
            </span>
          )}
        </div>
        <p className="text-sm text-ink-muted">{user.email ?? "(no email)"}</p>
        <p className="text-xs text-ink-muted mt-1 font-mono break-all">
          {user.id}
        </p>
        <p className="text-xs text-ink-muted mt-1">
          Joined {fmtDate(user.created_at)}
          {user.last_seen_at ? (
            <> &middot; Last seen {fmtDate(user.last_seen_at)}</>
          ) : null}
        </p>
        <p className="text-xs text-ink-muted mt-1">
          Public badge: {user.is_verified ? "On" : "Off"} &middot; Selfie
          verification: {humanizeStatus(user.identity_verification_status)}
          &middot; Manual review: {manualReviewSummary(user)}
        </p>
      </div>

      {/* Counts grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <CountBlock
          label="Listings"
          value={counts.listings_total}
          sub={`${counts.listings_active} active`}
        />
        <CountBlock label="Deals (host)" value={counts.deals_as_host} />
        <CountBlock label="Deals (buyer)" value={counts.deals_as_buyer} />
        <CountBlock label="Reports filed" value={counts.reports_filed} />
        <CountBlock
          label="Reports received"
          value={counts.reports_received}
        />
        <CountBlock
          label="Rating"
          value={
            user.rating_avg && user.rating_count
              ? user.rating_avg.toFixed(1)
              : "—"
          }
          sub={
            user.rating_count
              ? `${user.rating_count} rating${
                  user.rating_count === 1 ? "" : "s"
                }`
              : "no ratings"
          }
        />
      </div>

      {/* Ban context, if any */}
      {user.banned_reason && (status === "temp_banned" || status === "perm_banned") ? (
        <div className="mb-6 p-4 rounded-card border border-amber-200 bg-amber-50">
          <p className="text-xs uppercase tracking-[0.14em] text-amber-900 mb-2">
            Ban reason
          </p>
          <p className="text-sm text-amber-900">{user.banned_reason}</p>
          {user.banned_until ? (
            <p className="text-xs text-amber-900 mt-2">
              Until: {fmtDate(user.banned_until)}
            </p>
          ) : null}
          {status === "perm_banned" ? (
            <p className="text-xs text-amber-900 mt-2">
              Permanent ban &mdash; no auto-expiry.
            </p>
          ) : null}
        </div>
      ) : null}

      {/* Self-delete context, if any */}
      {status === "self_deleted" ? (
        <div className="mb-6 p-4 rounded-card border border-gray-300 bg-gray-50">
          <p className="text-xs uppercase tracking-[0.14em] text-gray-700 mb-2">
            Self-deletion
          </p>
          <p className="text-sm text-gray-700">
            User initiated account deletion on {fmtDate(user.deleted_at)}.
            7-day cron will hard-delete unless restored.
          </p>
        </div>
      ) : null}

      {/* Action panel */}
      <UserActionPanel user={user} onActionComplete={fetchDetail} />

      {/* Tabbed activity */}
      <UserDetailTabs userId={userId} counts={counts} />
    </div>
  );
}

function CountBlock({
  label,
  value,
  sub,
}: {
  label: string;
  value: number | string;
  sub?: string;
}) {
  return (
    <div className="p-3 rounded-card border border-line bg-cream-card">
      <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-1">
        {label}
      </p>
      <p className="text-xl font-medium text-ink">{value}</p>
      {sub ? <p className="text-xs text-ink-muted mt-0.5">{sub}</p> : null}
    </div>
  );
}
