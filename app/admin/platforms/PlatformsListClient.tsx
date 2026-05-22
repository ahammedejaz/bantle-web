"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useAdminToast } from "@/components/admin/AdminToastProvider";
import { PlatformRow, type Platform } from "@/components/admin/PlatformRow";
import {
  PlatformEditorDialog,
  type EditorMode,
} from "@/components/admin/PlatformEditorDialog";

type CategoryKey = "music" | "video" | "cloud" | "work";
type PlatformToggleResponse = {
  notification_summary?: {
    recipient_count?: number;
    notification_failed_count?: number;
    push_failure_count?: number;
  };
};

const CATEGORY_GROUPS: Array<{ key: CategoryKey; label: string }> = [
  { key: "music", label: "Music" },
  { key: "video", label: "Video" },
  { key: "cloud", label: "Cloud" },
  { key: "work", label: "Work" },
];

export function PlatformsListClient() {
  const toast = useAdminToast();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>("create");
  const [editorTarget, setEditorTarget] = useState<Platform | null>(null);

  const fetchPlatforms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/admin/api/platforms");
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { platforms: Platform[] };
      setPlatforms(data.platforms);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to load platforms.";
      toast.show(message, "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchPlatforms();
  }, [fetchPlatforms]);

  const openCreate = () => {
    setEditorMode("create");
    setEditorTarget(null);
    setEditorOpen(true);
  };

  const openEdit = (platform: Platform) => {
    setEditorMode("edit");
    setEditorTarget(platform);
    setEditorOpen(true);
  };

  const handleToggleActive = useCallback(
    async (platform: Platform) => {
      const next = !(platform.is_active !== false);
      try {
        const res = await fetch(`/admin/api/platforms/${platform.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_active: next }),
        });
        if (!res.ok) {
          const data = (await res
            .json()
            .catch(() => ({ error: `HTTP ${res.status}` }))) as {
            error?: string;
          };
          throw new Error(data.error ?? `HTTP ${res.status}`);
        }
        const data = (await res.json()) as PlatformToggleResponse;
        const summary = data.notification_summary;
        const failures =
          (summary?.notification_failed_count ?? 0) +
          (summary?.push_failure_count ?? 0);
        if (failures > 0) {
          toast.show(
            next
              ? "Platform activated. Some notifications failed."
              : "Platform deactivated. Some notifications failed.",
            "error",
          );
        } else if ((summary?.recipient_count ?? 0) > 0) {
          toast.show(
            next
              ? `Platform activated. Notified ${summary?.recipient_count} affected user${
                  summary?.recipient_count === 1 ? "" : "s"
                }.`
              : `Platform deactivated. Notified ${summary?.recipient_count} affected user${
                  summary?.recipient_count === 1 ? "" : "s"
                }.`,
            "success",
          );
        } else {
          toast.show(
            next ? "Platform activated." : "Platform deactivated.",
            "success",
          );
        }
        await fetchPlatforms();
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Toggle failed.";
        toast.show(message, "error");
      }
    },
    [toast, fetchPlatforms],
  );

  const handleEditorSuccess = (message: string) => {
    toast.show(message, "success");
    setEditorOpen(false);
    void fetchPlatforms();
  };
  const handleEditorError = (message: string) => {
    toast.show(message, "error");
  };

  // Group platforms by category.
  const grouped = new Map<CategoryKey, Platform[]>();
  for (const group of CATEGORY_GROUPS) grouped.set(group.key, []);
  for (const platform of platforms) {
    const bucket = grouped.get(platform.category as CategoryKey);
    if (bucket) bucket.push(platform);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs text-ink-muted">
          {loading
            ? "Loading…"
            : `${platforms.length} platform${
                platforms.length === 1 ? "" : "s"
              }`}
        </span>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-button bg-teal-900 text-cream text-sm font-medium hover:bg-teal-800 transition-colors"
        >
          <Plus size={14} />
          Add platform
        </button>
      </div>

      {loading && platforms.length === 0 ? (
        <div className="text-sm text-ink-muted">Loading platforms&hellip;</div>
      ) : (
        <div className="space-y-8">
          {CATEGORY_GROUPS.map((group) => {
            const items = grouped.get(group.key) ?? [];
            return (
              <section key={group.key}>
                <h2 className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-3">
                  {group.label}{" "}
                  <span className="text-ink-muted">({items.length})</span>
                </h2>
                {items.length === 0 ? (
                  <div className="border border-line rounded-card bg-cream-card p-4 text-sm text-ink-muted text-center">
                    No platforms in this category yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((platform) => (
                      <PlatformRow
                        key={platform.id}
                        platform={platform}
                        onEdit={() => openEdit(platform)}
                        onToggleActive={() => handleToggleActive(platform)}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      <PlatformEditorDialog
        open={editorOpen}
        mode={editorMode}
        platform={editorTarget}
        onClose={() => setEditorOpen(false)}
        onSuccess={handleEditorSuccess}
        onError={handleEditorError}
      />
    </div>
  );
}
