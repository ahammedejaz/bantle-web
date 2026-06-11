import type { SupabaseClient } from "@supabase/supabase-js";

export const REVIEW_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "cancelled",
] as const;

export type ReviewStatus = (typeof REVIEW_STATUSES)[number];
export type ReviewStatusFilter = ReviewStatus | "all";

export const SIGNED_URL_TTL_SECONDS = 5 * 60;

export function isReviewStatus(value: string | null): value is ReviewStatus {
  return REVIEW_STATUSES.includes(value as ReviewStatus);
}

export function parseReviewStatusFilter(
  value: string | null,
): ReviewStatusFilter | null {
  if (!value || value === "pending") return "pending";
  if (value === "all") return "all";
  return isReviewStatus(value) ? value : null;
}

export function parsePage(value: string | null): number {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(page) ? Math.max(1, page) : 1;
}

export function shortId(id: string | null | undefined): string {
  if (!id) return "unknown";
  return id.length <= 8 ? id : id.slice(0, 8);
}

export function addDaysIso(base: Date, days: number): string {
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}

export function parseOptionalAdminNote(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 2000);
}

export function parseRequiredRejectionMessage(
  value: unknown,
): { value: string } | { error: string } {
  if (typeof value !== "string") {
    return { error: "User-visible rejection message is required." };
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return { error: "User-visible rejection message is required." };
  }
  if (trimmed.length > 1000) {
    return {
      error: "User-visible rejection message must be 1000 characters or less.",
    };
  }
  return { value: trimmed };
}

export async function getTrustRetentionSettings(
  supabase: SupabaseClient,
): Promise<{
  approved_selfie_retention_days: number;
  rejected_selfie_retention_days: number;
}> {
  const { data, error } = await supabase
    .from("trust_system_settings")
    .select("approved_selfie_retention_days, rejected_selfie_retention_days")
    .eq("id", true)
    .maybeSingle();

  if (error || !data) {
    return {
      approved_selfie_retention_days: 180,
      rejected_selfie_retention_days: 30,
    };
  }

  return {
    approved_selfie_retention_days:
      typeof data.approved_selfie_retention_days === "number"
        ? data.approved_selfie_retention_days
        : 180,
    rejected_selfie_retention_days:
      typeof data.rejected_selfie_retention_days === "number"
        ? data.rejected_selfie_retention_days
        : 30,
  };
}

export async function createVerificationSelfieSignedUrl(
  supabase: SupabaseClient,
  row: {
    storage_bucket: string | null;
    storage_path: string | null;
    image_deleted_at?: string | null;
  },
): Promise<{
  signed_url: string | null;
  signed_url_expires_in_seconds: number | null;
  image_unavailable_reason: string | null;
}> {
  if (row.storage_bucket !== "verification-selfies") {
    return unavailable("invalid_bucket");
  }
  if (!row.storage_path || !isVerificationStoragePath(row.storage_path)) {
    return unavailable("invalid_storage_path");
  }
  if (row.image_deleted_at) {
    return unavailable("image_deleted");
  }

  const parts = row.storage_path.split("/");
  const folder = `${parts[0]}/${parts[1]}`;
  const fileName = parts[2];

  const { data: objects, error: listError } = await supabase.storage
    .from("verification-selfies")
    .list(folder, {
      limit: 10,
      search: fileName,
    });

  if (listError) return unavailable("storage_lookup_failed");

  const objectExists = (objects ?? []).some((object) => object.name === fileName);
  if (!objectExists) return unavailable("image_missing");

  const { data, error } = await supabase.storage
    .from("verification-selfies")
    .createSignedUrl(row.storage_path, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) return unavailable("signed_url_failed");

  return {
    signed_url: data.signedUrl,
    signed_url_expires_in_seconds: SIGNED_URL_TTL_SECONDS,
    image_unavailable_reason: null,
  };
}

function isVerificationStoragePath(path: string): boolean {
  return /^verification\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$/i.test(
    path,
  );
}

function unavailable(reason: string) {
  return {
    signed_url: null,
    signed_url_expires_in_seconds: null,
    image_unavailable_reason: reason,
  };
}
