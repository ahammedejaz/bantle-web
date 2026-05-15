"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Platform {
  id: string;
  label: string;
  category: string;
  default_monthly_price: number;
  brand_color: string;
  brand_initials: string;
  is_active: boolean | null;
  display_order: number | null;
  created_at: string | null;
  listing_count: number;
}

interface PlatformRowProps {
  platform: Platform;
  onEdit: () => void;
  onToggleActive: () => Promise<void>;
}

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

export function PlatformRow({
  platform,
  onEdit,
  onToggleActive,
}: PlatformRowProps) {
  const [toggling, setToggling] = useState(false);
  const active = platform.is_active !== false;
  // Defensive: if a future row somehow stores an invalid color, fall
  // back to a muted gray so the row still renders. brand_color is
  // NOT NULL in the schema (recon Query 1b) but we don't trust data.
  const tileBg = HEX_RE.test(platform.brand_color)
    ? platform.brand_color
    : "#999999";

  const handleToggle = async () => {
    setToggling(true);
    try {
      await onToggleActive();
    } finally {
      setToggling(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 border border-line rounded-card bg-cream-card",
        !active && "opacity-60",
      )}
    >
      {/* Brand tile */}
      <div
        className="w-10 h-10 rounded-card flex items-center justify-center text-white text-xs font-bold shrink-0"
        style={{ backgroundColor: tileBg }}
      >
        {platform.brand_initials}
      </div>

      {/* Identity */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-ink truncate">
            {platform.label}
          </span>
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-button border",
              active
                ? "bg-teal-50 text-teal-900 border-teal-200"
                : "bg-gray-100 text-gray-600 border-gray-200",
            )}
          >
            {active ? "Active" : "Inactive"}
          </span>
        </div>
        <p className="text-xs text-ink-muted font-mono mt-1 truncate">
          {platform.id}
        </p>
      </div>

      {/* Stats */}
      <div className="hidden sm:flex flex-col items-end shrink-0 text-xs text-ink-muted">
        <span className="text-ink">
          ₹{platform.default_monthly_price}/mo
        </span>
        <span>
          {platform.listing_count} listing
          {platform.listing_count === 1 ? "" : "s"}
        </span>
        <span className="text-[10px]">order {platform.display_order ?? 0}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-button border border-line bg-white text-xs font-medium text-ink hover:bg-cream transition-colors"
        >
          <Pencil size={12} />
          Edit
        </button>
        <button
          type="button"
          onClick={handleToggle}
          disabled={toggling}
          className={cn(
            "inline-flex items-center px-3 py-1.5 rounded-button text-xs font-medium transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            active
              ? "bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100"
              : "bg-teal-50 border border-teal-200 text-teal-900 hover:bg-teal-100",
          )}
        >
          {toggling
            ? "Working…"
            : active
              ? "Deactivate"
              : "Activate"}
        </button>
      </div>
    </div>
  );
}
