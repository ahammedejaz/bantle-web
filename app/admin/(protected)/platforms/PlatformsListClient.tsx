"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useAdminToast } from "@/components/admin/AdminToastProvider";
import { PlatformCategoriesPanel } from "@/components/admin/PlatformCategoriesPanel";
import { PlatformRow, type Platform } from "@/components/admin/PlatformRow";
import {
  PlatformEditorDialog,
  type EditorMode,
} from "@/components/admin/PlatformEditorDialog";
import type { PlatformCategory } from "@/lib/platform-categories";

type PlatformToggleResponse = {
  notification_summary?: {
    recipient_count?: number;
    notification_failed_count?: number;
    push_failure_count?: number;
  };
};

export function PlatformsListClient() {
  const toast = useAdminToast();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [categories, setCategories] = useState<PlatformCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>("create");
  const [editorTarget, setEditorTarget] = useState<Platform | null>(null);

  const fetchPlatforms = useCallback(async () => {
    setLoading(true);
    try {
      const [platformsRes, categoriesRes] = await Promise.all([
        fetch("/admin/api/platforms"),
        fetch("/admin/api/platform-categories"),
      ]);
      if (!platformsRes.ok) {
        const text = await platformsRes.text();
        throw new Error(text || `HTTP ${platformsRes.status}`);
      }
      if (!categoriesRes.ok) {
        const text = await categoriesRes.text();
        throw new Error(text || `HTTP ${categoriesRes.status}`);
      }
      const platformsData = (await platformsRes.json()) as {
        platforms: Platform[];
      };
      const categoriesData = (await categoriesRes.json()) as {
        categories: PlatformCategory[];
      };
      setPlatforms(platformsData.platforms);
      setCategories(categoriesData.categories);
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
        const notificationFailures = summary?.notification_failed_count ?? 0;
        const pushFailures = summary?.push_failure_count ?? 0;
        if (notificationFailures > 0) {
          toast.show(
            next
              ? "Platform activated, but some in-app notifications failed."
              : "Platform deactivated, but some in-app notifications failed.",
            "error",
          );
        } else if (pushFailures > 0) {
          toast.show(
            next
              ? "Platform activated. In-app notifications were sent, but push failed for some users."
              : "Platform deactivated. In-app notifications were sent, but push failed for some users.",
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

  // Group platforms by managed category. Unknown categories are kept visible
  // defensively instead of being dropped.
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const grouped = new Map<string, Platform[]>();
  for (const category of categories) grouped.set(category.id, []);
  for (const platform of platforms) {
    const bucket = grouped.get(platform.category);
    if (bucket) {
      bucket.push(platform);
    } else {
      grouped.set(platform.category, [platform]);
    }
  }
  const categoryGroups = [
    ...categories.map((category) => ({
      key: category.id,
      label: category.label,
      inactive: category.is_active === false,
      items: grouped.get(category.id) ?? [],
    })),
    ...Array.from(grouped.entries())
      .filter(([categoryId]) => !categoryById.has(categoryId))
      .map(([categoryId, items]) => ({
        key: categoryId,
        label: `${categoryId} (unknown)`,
        inactive: true,
        items,
      })),
  ];

  return (
    <div>
      <PlatformCategoriesPanel
        categories={categories}
        platforms={platforms}
        onChanged={fetchPlatforms}
        onSuccess={(message) => toast.show(message, "success")}
        onError={(message) => toast.show(message, "error")}
      />

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
          {categoryGroups.map((group) => {
            const items = group.items;
            return (
              <section key={group.key}>
                <h2 className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-3">
                  {group.label}{" "}
                  <span className="text-ink-muted">({items.length})</span>
                  {group.inactive ? (
                    <span className="ml-2 normal-case tracking-normal text-ink-muted">
                      inactive
                    </span>
                  ) : null}
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
        categories={categories}
        onClose={() => setEditorOpen(false)}
        onSuccess={handleEditorSuccess}
        onError={handleEditorError}
      />
    </div>
  );
}
