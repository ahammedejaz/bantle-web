"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DealStatusBadge } from "./DealStatusBadge";
import { dealTermsSummary, dealTermsType } from "@/lib/adminTerms";

export interface DealListItem {
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
  listing: {
    id: string;
    title: string | null;
    platform: string | null;
    listing_type?: string | null;
    status: string | null;
    archived_at: string | null;
  } | null;
  host: ProfileSummary | null;
  buyer: ProfileSummary | null;
}

type ProfileSummary = {
  id: string;
  display_name: string | null;
  email: string | null;
  deleted_at: string | null;
  banned_until: string | null;
  permanently_banned: boolean | null;
  is_admin?: boolean | null;
};

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function profileLabel(profile: ProfileSummary | null): string {
  if (!profile) return "Missing profile";
  if (profile.display_name?.trim()) return profile.display_name;
  return profile.email ?? "Unnamed user";
}

export function DealRow({ deal }: { deal: DealListItem }) {
  const isOneTime = dealTermsType(deal) === "one_time";
  return (
    <Link
      href={`/admin/deals/${deal.id}`}
      className="block border border-line rounded-card bg-cream-card p-4 hover:border-teal-200 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-sm font-medium text-ink truncate">
              {deal.listing?.title ?? "Listing unavailable"}
            </span>
            <DealStatusBadge
              status={deal.status}
              terminationSource={deal.termination_source}
              terminatedAt={deal.terminated_at}
            />
          </div>
          <p className="text-xs text-ink-muted truncate">
            {deal.listing?.platform ?? "Unknown platform"} · Host:{" "}
            {profileLabel(deal.host)} · Buyer: {profileLabel(deal.buyer)}
          </p>
          <p className="text-xs text-ink-muted mt-1">
            {isOneTime ? "One-time access" : "Monthly sharing"} ·{" "}
            {dealTermsSummary(deal)}
            {deal.started_at ? ` · started ${fmtDate(deal.started_at)}` : ""}
            {deal.ends_at ? ` · ends ${fmtDate(deal.ends_at)}` : ""}
          </p>
          {deal.termination_source === "admin" && deal.terminated_at ? (
            <p className="text-xs text-red-900 mt-2">
              Terminated {fmtDate(deal.terminated_at)}
              {deal.termination_reason ? `: ${deal.termination_reason}` : ""}
            </p>
          ) : null}
        </div>

        <div className="text-right text-xs text-ink-muted shrink-0">
          <p>Created {fmtDate(deal.created_at)}</p>
          <p className="font-mono mt-1 max-w-[8rem] truncate">{deal.id}</p>
        </div>

        <ChevronRight size={16} className="text-ink-muted shrink-0 mt-1" />
      </div>
    </Link>
  );
}
