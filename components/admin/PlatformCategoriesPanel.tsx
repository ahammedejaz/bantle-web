"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CATEGORY_ICON_KEYS,
  type PlatformCategory,
} from "@/lib/platform-categories";
import type { Platform } from "./PlatformRow";

type CategoryDraft = {
  label: string;
  display_order: string;
  icon_key: string;
  is_active: boolean;
};

interface PlatformCategoriesPanelProps {
  categories: PlatformCategory[];
  platforms: Platform[];
  onChanged: () => Promise<void>;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const EMPTY_DRAFT: CategoryDraft = {
  label: "",
  display_order: "50",
  icon_key: "other",
  is_active: true,
};

function suggestCategoryId(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function PlatformCategoriesPanel({
  categories,
  platforms,
  onChanged,
  onSuccess,
  onError,
}: PlatformCategoriesPanelProps) {
  const [drafts, setDrafts] = useState<Record<string, CategoryDraft>>({});
  const [newId, setNewId] = useState("");
  const [newDraft, setNewDraft] = useState<CategoryDraft>(EMPTY_DRAFT);
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const newIdTouchedRef = useRef(false);

  useEffect(() => {
    setDrafts(
      Object.fromEntries(
        categories.map((category) => [
          category.id,
          {
            label: category.label,
            display_order: String(category.display_order),
            icon_key: category.icon_key ?? "",
            is_active: category.is_active,
          },
        ]),
      ),
    );
  }, [categories]);

  const platformCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const platform of platforms) {
      counts.set(platform.category, (counts.get(platform.category) ?? 0) + 1);
    }
    return counts;
  }, [platforms]);

  const handleNewLabelChange = (label: string) => {
    setNewDraft((prev) => ({ ...prev, label }));
    if (!newIdTouchedRef.current) setNewId(suggestCategoryId(label));
  };

  const createCategory = async () => {
    setCreating(true);
    try {
      const res = await fetch("/admin/api/platform-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newId,
          label: newDraft.label.trim(),
          display_order: Number(newDraft.display_order),
          icon_key: newDraft.icon_key || null,
          is_active: newDraft.is_active,
        }),
      });
      if (!res.ok) {
        const data = (await res
          .json()
          .catch(() => ({ error: `HTTP ${res.status}` }))) as {
          error?: string;
        };
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setNewId("");
      setNewDraft(EMPTY_DRAFT);
      newIdTouchedRef.current = false;
      await onChanged();
      onSuccess("Category created.");
    } catch (error) {
      onError(error instanceof Error ? error.message : "Create failed.");
    } finally {
      setCreating(false);
    }
  };

  const saveCategory = async (categoryId: string) => {
    const draft = drafts[categoryId];
    if (!draft) return;
    setSavingId(categoryId);
    try {
      const res = await fetch(`/admin/api/platform-categories/${categoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: draft.label.trim(),
          display_order: Number(draft.display_order),
          icon_key: draft.icon_key || null,
          is_active: draft.is_active,
        }),
      });
      if (!res.ok) {
        const data = (await res
          .json()
          .catch(() => ({ error: `HTTP ${res.status}` }))) as {
          error?: string;
        };
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      await onChanged();
      onSuccess("Category updated.");
    } catch (error) {
      onError(error instanceof Error ? error.message : "Update failed.");
    } finally {
      setSavingId(null);
    }
  };

  const setDraft = (
    categoryId: string,
    update: Partial<CategoryDraft>,
  ) => {
    setDrafts((prev) => ({
      ...prev,
      [categoryId]: { ...prev[categoryId], ...update },
    }));
  };

  return (
    <section className="mb-8 border border-line rounded-card bg-cream-card p-4">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-medium text-teal-900">
            Platform categories
          </h2>
          <p className="text-xs text-ink-muted mt-1 max-w-2xl">
            Manage category labels, order, icons, and availability. Older app
            builds keep showing only the original categories until users update.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_120px_130px_auto_auto] gap-2 text-xs font-medium text-ink-muted mb-2 px-1">
        <span>Label</span>
        <span>ID</span>
        <span>Icon</span>
        <span>Order</span>
        <span>Status</span>
        <span className="text-right">Action</span>
      </div>

      <div className="space-y-2">
        {categories.map((category) => {
          const draft = drafts[category.id];
          if (!draft) return null;
          const usedBy = platformCounts.get(category.id) ?? 0;
          const saving = savingId === category.id;

          return (
            <div
              key={category.id}
              className="grid grid-cols-1 md:grid-cols-[1fr_1fr_120px_130px_auto_auto] gap-2 items-center border border-line rounded-card bg-white p-3"
            >
              <input
                type="text"
                aria-label={`${category.label} category label`}
                value={draft.label}
                onChange={(e) =>
                  setDraft(category.id, { label: e.target.value })
                }
                disabled={saving}
                maxLength={60}
                className={inputClass}
              />
              <div>
                <p className="font-mono text-xs text-ink truncate">
                  {category.id}
                </p>
                <p className="text-[10px] text-ink-muted">
                  {usedBy} platform{usedBy === 1 ? "" : "s"}
                </p>
              </div>
              <select
                aria-label={`${category.label} category icon`}
                value={draft.icon_key}
                onChange={(e) =>
                  setDraft(category.id, { icon_key: e.target.value })
                }
                disabled={saving}
                className={inputClass}
              >
                <option value="">fallback</option>
                {CATEGORY_ICON_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
              <input
                type="number"
                aria-label={`${category.label} category display order`}
                value={draft.display_order}
                onChange={(e) =>
                  setDraft(category.id, { display_order: e.target.value })
                }
                disabled={saving}
                className={inputClass}
              />
              <button
                type="button"
                aria-label={
                  draft.is_active
                    ? `Mark ${category.label} inactive`
                    : `Mark ${category.label} active`
                }
                onClick={() =>
                  setDraft(category.id, { is_active: !draft.is_active })
                }
                disabled={saving}
                className={cn(
                  "px-3 py-2 rounded-button border text-xs font-medium transition-colors",
                  draft.is_active
                    ? "bg-teal-50 text-teal-900 border-teal-200"
                    : "bg-gray-100 text-gray-700 border-gray-200",
                )}
              >
                {draft.is_active ? "Active" : "Inactive"}
              </button>
              <button
                type="button"
                aria-label={`Save ${category.label} category`}
                onClick={() => void saveCategory(category.id)}
                disabled={saving}
                className={cn(
                  "inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-button",
                  "bg-teal-900 text-cream text-xs font-medium hover:bg-teal-800 transition-colors",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                )}
              >
                <Save size={13} />
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 border border-dashed border-line rounded-card bg-cream p-3">
        <p className="text-xs font-medium text-teal-900 mb-3">
          Create category
        </p>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_120px_130px_auto] gap-2 items-center">
          <input
            type="text"
            aria-label="New category label"
            value={newDraft.label}
            onChange={(e) => handleNewLabelChange(e.target.value)}
            disabled={creating}
            placeholder="Gaming"
            maxLength={60}
            className={inputClass}
          />
          <input
            type="text"
            aria-label="New category id"
            value={newId}
            onChange={(e) => {
              newIdTouchedRef.current = true;
              setNewId(
                e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
              );
            }}
            disabled={creating}
            placeholder="gaming"
            maxLength={40}
            className={cn(inputClass, "font-mono")}
          />
          <select
            aria-label="New category icon"
            value={newDraft.icon_key}
            onChange={(e) =>
              setNewDraft((prev) => ({ ...prev, icon_key: e.target.value }))
            }
            disabled={creating}
            className={inputClass}
          >
            {CATEGORY_ICON_KEYS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
          <input
            type="number"
            aria-label="New category display order"
            value={newDraft.display_order}
            onChange={(e) =>
              setNewDraft((prev) => ({
                ...prev,
                display_order: e.target.value,
              }))
            }
            disabled={creating}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => void createCategory()}
            disabled={creating}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-button",
              "bg-teal-900 text-cream text-xs font-medium hover:bg-teal-800 transition-colors",
              "disabled:opacity-60 disabled:cursor-not-allowed",
            )}
          >
            <Plus size={13} />
            {creating ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </section>
  );
}

const inputClass =
  "w-full px-3 py-2 text-sm border border-line rounded-button bg-cream text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-teal-900 disabled:opacity-60 disabled:cursor-not-allowed";
