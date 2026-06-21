"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  getUserDisplayName,
  getUserStatus,
  getUserStatusDisplay,
} from "./userStatus";

interface UserRowProps {
  user: {
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
    identity_verification_status: string;
    manual_verification_status: string;
    manual_verification_category: string | null;
  };
}

export function UserRow({ user }: UserRowProps) {
  const name = getUserDisplayName(user);
  const status = getUserStatus(user);
  const statusDisplay = getUserStatusDisplay(status);
  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <Link
      href={`/admin/users/${user.id}`}
      className="block border border-line rounded-card bg-cream-card p-4 mb-3 hover:border-teal-200 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-medium text-ink truncate">
              {name}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-button border ${statusDisplay.className}`}
            >
              {statusDisplay.label}
            </span>
            <span
              className={
                user.is_verified
                  ? "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-button border bg-teal-50 text-teal-900 border-teal-200"
                  : "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-button border bg-gray-50 text-gray-700 border-gray-200"
              }
            >
              Public badge: {user.is_verified ? "On" : "Off"}
            </span>
          </div>
          <p className="text-xs text-ink-muted truncate">
            {user.email ?? "(no email)"}
          </p>
          <p className="text-xs text-ink-muted mt-1">
            Joined {joinedDate}
            {user.rating_count && user.rating_count > 0 ? (
              <>
                {" "}
                &middot; {(user.rating_avg ?? 0).toFixed(1)}&#9733; (
                {user.rating_count} ratings)
              </>
            ) : null}
          </p>
          <p className="text-xs text-ink-muted mt-1">
            Selfie: {humanizeStatus(user.identity_verification_status)} &middot;
            Manual: {manualReviewLabel(user)}
          </p>
        </div>
        <ChevronRight size={16} className="text-ink-muted shrink-0 mt-1" />
      </div>
    </Link>
  );
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

function manualReviewLabel(user: {
  manual_verification_status: string;
  manual_verification_category: string | null;
}): string {
  if (
    user.manual_verification_status === "approved" &&
    user.manual_verification_category
  ) {
    return `${humanizeStatus(user.manual_verification_status)} (${humanizeStatus(
      user.manual_verification_category,
    )})`;
  }
  return humanizeStatus(user.manual_verification_status);
}
