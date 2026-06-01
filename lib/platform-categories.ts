export const CATEGORY_ICON_KEYS = [
  "music",
  "video",
  "cloud",
  "work",
  "game",
  "book",
  "fitness",
  "news",
  "shopping",
  "other",
] as const;

export type CategoryIconKey = (typeof CATEGORY_ICON_KEYS)[number];

export interface PlatformCategory {
  id: string;
  label: string;
  display_order: number;
  icon_key: CategoryIconKey | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const CATEGORY_SLUG_RE = /^[a-z0-9][a-z0-9_-]*$/;

export function isValidCategoryIconKey(
  value: string,
): value is CategoryIconKey {
  return CATEGORY_ICON_KEYS.includes(value as CategoryIconKey);
}

export function validateCategoryId(id: string): string | null {
  if (!id || id.length < 2 || id.length > 40 || !CATEGORY_SLUG_RE.test(id)) {
    return "id must be 2-40 chars, lowercase letters/digits/hyphens/underscores only";
  }
  return null;
}

export function validateCategoryLabel(label: string): string | null {
  if (!label || label.length > 60) {
    return "label is required, max 60 chars";
  }
  return null;
}

export function validateCategoryDisplayOrder(
  displayOrder: number,
): string | null {
  if (
    !Number.isInteger(displayOrder) ||
    displayOrder < -10000 ||
    displayOrder > 10000
  ) {
    return "display_order must be an integer between -10000 and 10000";
  }
  return null;
}

export function validateCategoryIconKey(iconKey: string | null): string | null {
  if (iconKey !== null && !isValidCategoryIconKey(iconKey)) {
    return `icon_key must be one of: ${CATEGORY_ICON_KEYS.join(", ")}`;
  }
  return null;
}
