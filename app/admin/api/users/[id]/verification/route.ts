// PATCH /admin/api/users/[id]/verification - structured admin/manual review.
// Body:
//   { action: "manual_approve", category, reason, internal_note? }
//   { action: "manual_revoke", reason, internal_note? }

import { type NextRequest, NextResponse } from "next/server";
import {
  adminErrorResponse,
  safeAdminErrorLog,
} from "@/lib/admin-safe-errors";
import { requireAdmin } from "@/lib/admin-auth";

type VerificationAction = "manual_approve" | "manual_revoke";
type ManualVerificationCategory =
  | "individual_exception"
  | "company"
  | "vendor"
  | "partner"
  | "other";

interface VerificationActionBody {
  action?: string;
  category?: unknown;
  reason?: unknown;
  internal_note?: unknown;
}

const MANUAL_CATEGORIES: readonly ManualVerificationCategory[] = [
  "individual_exception",
  "company",
  "vendor",
  "partner",
  "other",
];

const USER_SELECT = "id,is_admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { admin, supabase } = auth;

  const { id } = await params;
  const userId = id;

  let body: VerificationActionBody;
  try {
    body = (await request.json()) as VerificationActionBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isVerificationAction(body.action)) {
    return NextResponse.json(
      {
        error:
          "action must be manual_approve or manual_revoke",
      },
      { status: 400 },
    );
  }

  const { data: targetUser, error: targetError } = await supabase
    .from("profiles")
    .select(USER_SELECT)
    .eq("id", userId)
    .maybeSingle();

  if (targetError || !targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (targetUser.is_admin) {
    return NextResponse.json(
      { error: "Cannot change verification for an admin account" },
      { status: 400 },
    );
  }

  const reason = parseRequiredText(body.reason, "Reason");
  if ("error" in reason) {
    return NextResponse.json({ error: reason.error }, { status: 400 });
  }
  const internalNote = parseOptionalText(body.internal_note);
  const category =
    body.action === "manual_approve" ? body.category : undefined;
  if (body.action === "manual_approve" && !isManualCategory(category)) {
    return NextResponse.json(
      { error: "Valid category is required." },
      { status: 400 },
    );
  }

  const rpc =
    body.action === "manual_approve"
      ? await supabase.rpc("admin_approve_manual_verification", {
          p_user_id: userId,
          p_admin_id: admin.id,
          p_category: category,
          p_reason: reason.value,
          p_internal_note: internalNote,
          p_expires_at: null,
        })
      : await supabase.rpc("admin_revoke_manual_verification", {
          p_user_id: userId,
          p_admin_id: admin.id,
          p_reason: reason.value,
          p_internal_note: internalNote,
        });

  if (rpc.error) {
    const correlationId = safeAdminErrorLog(
      "admin_manual_verification_rpc_failed",
      rpc.error,
      { operation: body.action },
    );
    return adminErrorResponse("Manual verification could not be updated.", 500, {
      correlationId,
    });
  }

  return NextResponse.json({ success: true, result: rpc.data ?? null });
}

function isVerificationAction(
  action: string | undefined,
): action is VerificationAction {
  return (
    action === "manual_approve" ||
    action === "manual_revoke"
  );
}

function isManualCategory(
  value: unknown,
): value is ManualVerificationCategory {
  return (
    typeof value === "string" &&
    (MANUAL_CATEGORIES as readonly string[]).includes(value)
  );
}

function parseRequiredText(
  value: unknown,
  label: string,
): { value: string } | { error: string } {
  if (typeof value !== "string") {
    return { error: `${label} is required.` };
  }
  const trimmed = value.trim();
  if (!trimmed) return { error: `${label} is required.` };
  if (trimmed.length > 1000) {
    return { error: `${label} must be 1000 characters or less.` };
  }
  return { value: trimmed };
}

function parseOptionalText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 2000);
}
