"use client";

import Link from "next/link";
import { Clock, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStatusDisplay } from "./reportStatus";

export interface ReportListItem {
  id: string;
  category: string;
  details: string | null;
  created_at: string;
  status: string;
  resolved_at: string | null;
  resolution_action: string | null;
  evidence_count?: number;
  reporter: {
    id: string;
    display_name: string | null;
    email: string | null;
  } | null;
  reported: {
    id: string;
    display_name: string | null;
    email: string | null;
    banned_until: string | null;
    deleted_at: string | null;
  } | null;
}

interface ReportRowProps {
  report: ReportListItem;
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

function categoryColor(c: string): string {
  switch (c) {
    case "harassment":
    case "illegal":
      return "bg-red-50 text-red-900 border-red-200";
    case "spam_scam":
    case "fake_profile":
      return "bg-amber-50 text-amber-900 border-amber-200";
    case "personal_info":
      return "bg-blue-50 text-blue-900 border-blue-200";
    default:
      return "bg-teal-50 text-teal-900 border-teal-200";
  }
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function ReportRow({ report }: ReportRowProps) {
  const statusDisplay = getStatusDisplay(report.status);
  const reportedBanned =
    report.reported?.banned_until &&
    new Date(report.reported.banned_until).getTime() > Date.now();
  const reportedDeleted = !!report.reported?.deleted_at;

  return (
    <Link
      href={`/admin/reports/${report.id}`}
      className="block bg-cream-card border border-line rounded-card p-4 hover:border-teal-200 transition-colors"
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs border",
            categoryColor(report.category),
          )}
        >
          {categoryLabel(report.category)}
        </span>
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs border",
            statusDisplay.className,
          )}
        >
          {statusDisplay.label}
        </span>
        {report.evidence_count ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border bg-emerald-50 text-emerald-900 border-emerald-200">
            <Paperclip size={12} />
            {report.evidence_count} evidence
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1 text-xs text-ink-muted ml-auto">
          <Clock size={12} />
          {timeAgo(report.created_at)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-6 text-sm">
        <div className="min-w-0">
          <span className="text-ink-muted text-xs">Reporter:</span>{" "}
          <span className="text-ink truncate">
            {report.reporter?.display_name ?? "(deleted)"}
          </span>
        </div>
        <div className="min-w-0">
          <span className="text-ink-muted text-xs">Reported:</span>{" "}
          <span className="text-ink truncate">
            {report.reported?.display_name ?? "(deleted)"}
          </span>
          {reportedDeleted ? (
            <span className="ml-2 text-xs text-red-700">deleted</span>
          ) : reportedBanned ? (
            <span className="ml-2 text-xs text-amber-700">banned</span>
          ) : null}
        </div>
      </div>

      {report.details ? (
        <p className="mt-3 text-sm text-ink-muted line-clamp-2">
          {report.details}
        </p>
      ) : null}
    </Link>
  );
}
