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
            {user.is_verified ? (
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-button border bg-teal-50 text-teal-900 border-teal-200">
                Verified
              </span>
            ) : null}
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
        </div>
        <ChevronRight size={16} className="text-ink-muted shrink-0 mt-1" />
      </div>
    </Link>
  );
}
