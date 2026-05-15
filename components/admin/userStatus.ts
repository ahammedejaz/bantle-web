// Shared display helpers for user state in the admin panel.
// Centralizes the null-display_name fallback, ban-state badge logic,
// and account-status derivation so every Phase 3 view stays consistent.

export type UserAccountStatus =
  | "active"
  | "temp_banned"
  | "perm_banned"
  | "self_deleted"
  | "admin";

export interface UserStatusDisplay {
  label: string;
  className: string;
}

// Single source of truth for "what's this user's name?" Every render
// of display_name in Phase 3 should call this — null display_name is
// confirmed-real in the production data (recon Query 7).
export function getUserDisplayName(user: {
  display_name: string | null;
  id: string;
}): string {
  if (user.display_name && user.display_name.trim()) {
    return user.display_name;
  }
  return `Unnamed user (${user.id.slice(0, 8)})`;
}

// Derive a single status from the user's columns. Priority order
// matters: admin > deleted > permbanned > tempbanned > active.
export function getUserStatus(user: {
  is_admin: boolean | null;
  permanently_banned: boolean | null;
  banned_until: string | null;
  deleted_at: string | null;
}): UserAccountStatus {
  if (user.is_admin) return "admin";
  if (user.deleted_at) return "self_deleted";
  if (user.permanently_banned) return "perm_banned";
  if (user.banned_until && new Date(user.banned_until).getTime() > Date.now()) {
    return "temp_banned";
  }
  return "active";
}

export function getUserStatusDisplay(
  status: UserAccountStatus,
): UserStatusDisplay {
  switch (status) {
    case "admin":
      return {
        label: "Admin",
        className: "bg-teal-900 text-cream border-teal-900",
      };
    case "active":
      return {
        label: "Active",
        className: "bg-teal-50 text-teal-900 border-teal-200",
      };
    case "temp_banned":
      return {
        label: "Temp banned",
        className: "bg-amber-50 text-amber-900 border-amber-200",
      };
    case "perm_banned":
      return {
        label: "Perma banned",
        className: "bg-red-50 text-red-900 border-red-200",
      };
    case "self_deleted":
      return {
        label: "Self-deleted",
        className: "bg-gray-50 text-gray-700 border-gray-200",
      };
  }
}

// Whether action buttons should be enabled for this user.
// Self-actioning is prevented at the UI layer; the API layer also
// rejects it as a defense in depth.
export function canTakeActionOn(
  user: { id: string },
  adminId: string,
): boolean {
  return user.id !== adminId;
}
