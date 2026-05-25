// PATCH /admin/api/platforms/[id] — update an existing platform.
// Body: any subset of:
//   { label, category, default_monthly_price, brand_color,
//     brand_initials, is_active, display_order }
// Slug (id) is IMMUTABLE — changing it would orphan listings since
// listings.platform has NO FK to platforms.id (recon Query 2b).

import { type NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminAction, type AdminActionType } from "@/lib/admin-actions";
import {
  getInternalFunctionHeaders,
} from "@/lib/admin-internal-functions";
import {
  adminErrorResponse,
  safeAdminErrorCode,
  safeAdminErrorLog,
  safeAdminWarning,
} from "@/lib/admin-safe-errors";

const VALID_CATEGORIES = ["music", "video", "cloud", "work"] as const;
type Category = (typeof VALID_CATEGORIES)[number];
const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

type Transition = "activated" | "deactivated";
type PlatformNotificationKind = "platform_activated" | "platform_deactivated";

type RecipientImpact = {
  userId: string;
  listingIds: Set<string>;
  dealIds: Set<string>;
};

type PlatformNotificationSummary = {
  transition: Transition | null;
  recipient_count: number;
  notification_inserted_count: number;
  notification_failed_count: number;
  push_success_count: number;
  push_failure_count: number;
  push_skipped_count: number;
  warnings: string[];
};

type PlatformRow = {
  id: string;
  label: string;
  is_active: boolean | null;
};

const EMPTY_SUMMARY: PlatformNotificationSummary = {
  transition: null,
  recipient_count: 0,
  notification_inserted_count: 0,
  notification_failed_count: 0,
  push_success_count: 0,
  push_failure_count: 0,
  push_skipped_count: 0,
  warnings: [],
};

function normalizedActive(row: Pick<PlatformRow, "is_active">): boolean {
  return row.is_active !== false;
}

function roleForImpact(impact: RecipientImpact): string {
  const hasListings = impact.listingIds.size > 0;
  const hasDeals = impact.dealIds.size > 0;
  if (hasListings && hasDeals) return "host_and_deal";
  if (hasListings) return "host_listing";
  return "deal_participant";
}

function firstOrNull(values: Set<string>): string | null {
  return values.values().next().value ?? null;
}

function impactFor(
  recipients: Map<string, RecipientImpact>,
  userId: string | null | undefined,
): RecipientImpact | null {
  if (!userId) return null;
  let impact = recipients.get(userId);
  if (!impact) {
    impact = {
      userId,
      listingIds: new Set<string>(),
      dealIds: new Set<string>(),
    };
    recipients.set(userId, impact);
  }
  return impact;
}

async function collectPlatformRecipients(
  supabase: SupabaseClient,
  platformId: string,
  transition: Transition,
): Promise<{ recipients: RecipientImpact[]; warnings: string[] }> {
  const recipients = new Map<string, RecipientImpact>();
  const warnings: string[] = [];

  const { data: listingRows, error: listingsError } = await supabase
    .from("listings")
    .select("id,user_id")
    .eq("platform", platformId)
    .eq("status", "active")
    .is("archived_at", null);

  if (listingsError) {
    safeAdminErrorLog("admin_platform_recipients_listings_failed", listingsError, {
      operation: "platform_recipient_lookup",
      transition,
    });
    warnings.push(
      safeAdminWarning(
        `active_listing_query_failed:${safeAdminErrorCode(listingsError)}`,
      ),
    );
  } else {
    for (const row of (listingRows ?? []) as Array<{
      id: string | null;
      user_id: string | null;
    }>) {
      const impact = impactFor(recipients, row.user_id);
      if (impact && row.id) impact.listingIds.add(row.id);
    }
  }

  if (transition === "deactivated") {
    const { data: dealRows, error: dealsError } = await supabase
      .from("deals")
      .select(
        "id,host_id,buyer_id,listing_id,listing:listings!inner(platform)",
      )
      .in("status", ["pending", "active"])
      .eq("listing.platform", platformId);

    if (dealsError) {
      safeAdminErrorLog("admin_platform_recipients_deals_failed", dealsError, {
        operation: "platform_recipient_lookup",
        transition,
      });
      warnings.push(
        safeAdminWarning(`deal_query_failed:${safeAdminErrorCode(dealsError)}`),
      );
    } else {
      for (const row of (dealRows ?? []) as Array<{
        id: string | null;
        host_id: string | null;
        buyer_id: string | null;
      }>) {
        for (const userId of [row.host_id, row.buyer_id]) {
          const impact = impactFor(recipients, userId);
          if (impact && row.id) impact.dealIds.add(row.id);
        }
      }
    }
  }

  return { recipients: Array.from(recipients.values()), warnings };
}

function notificationPayload(args: {
  platform: PlatformRow;
  recipient: RecipientImpact;
  previousActive: boolean;
  nextActive: boolean;
  eventId: string;
}) {
  const { platform, recipient, previousActive, nextActive, eventId } = args;
  const primaryListingId =
    recipient.listingIds.size === 1 ? firstOrNull(recipient.listingIds) : null;
  const primaryDealId =
    recipient.dealIds.size === 1 ? firstOrNull(recipient.dealIds) : null;
  return {
    platform_id: platform.id,
    platform_label: platform.label,
    previous_is_active: previousActive,
    is_active: nextActive,
    role: roleForImpact(recipient),
    affected_listing_count: recipient.listingIds.size,
    affected_deal_count: recipient.dealIds.size,
    primary_listing_id: primaryListingId,
    primary_deal_id: primaryDealId,
    event_id: eventId,
  };
}

async function insertPlatformNotifications(args: {
  supabase: SupabaseClient;
  kind: PlatformNotificationKind;
  platform: PlatformRow;
  recipients: RecipientImpact[];
  previousActive: boolean;
  nextActive: boolean;
  eventId: string;
}): Promise<{ inserted: number; failed: number; warning: string | null }> {
  const {
    supabase,
    kind,
    platform,
    recipients,
    previousActive,
    nextActive,
    eventId,
  } = args;
  if (recipients.length === 0) {
    return { inserted: 0, failed: 0, warning: null };
  }
  const rows = recipients.map((recipient) => ({
    user_id: recipient.userId,
    kind,
    payload: notificationPayload({
      platform,
      recipient,
      previousActive,
      nextActive,
      eventId,
    }),
  }));

  const { error } = await supabase.from("notifications").insert(rows);
  if (error) {
    safeAdminErrorLog("admin_platform_notification_insert_failed", error, {
      operation: "platform_notification_insert",
      kind,
      recipient_count: recipients.length,
    });
    return {
      inserted: 0,
      failed: recipients.length,
      warning: safeAdminWarning(
        `notification_insert_failed:${safeAdminErrorCode(error)}`,
      ),
    };
  }
  return { inserted: recipients.length, failed: 0, warning: null };
}

async function sendPlatformPushes(args: {
  supabase: SupabaseClient;
  kind: PlatformNotificationKind;
  platform: PlatformRow;
  recipients: RecipientImpact[];
  previousActive: boolean;
  nextActive: boolean;
  eventId: string;
}): Promise<{ success: number; failure: number; skipped: number; warnings: string[] }> {
  const {
    supabase,
    kind,
    platform,
    recipients,
    previousActive,
    nextActive,
    eventId,
  } = args;
  let success = 0;
  let failure = 0;
  let skipped = 0;
  const warnings: string[] = [];
  let internalHeaders: Record<string, string>;

  try {
    internalHeaders = getInternalFunctionHeaders();
  } catch (error) {
    safeAdminErrorLog("admin_platform_push_config_failed", error, {
      operation: "platform_push",
      kind,
      recipient_count: recipients.length,
    });
    return {
      success,
      failure: recipients.length,
      skipped,
      warnings: [safeAdminWarning("push_failed:config_error")],
    };
  }

  for (const recipient of recipients) {
    const payload = notificationPayload({
      platform,
      recipient,
      previousActive,
      nextActive,
      eventId,
    });
    const { data, error } = await supabase.functions.invoke(
      "send_push_notification",
      {
        headers: internalHeaders,
        body: {
          recipient_id: recipient.userId,
          kind,
          data: payload,
        },
      },
    );
    if (error) {
      failure += 1;
      safeAdminErrorLog("admin_platform_push_invoke_failed", error, {
        operation: "platform_push",
        kind,
      });
      warnings.push(
        safeAdminWarning(`push_failed:${safeAdminErrorCode(error)}`),
      );
      continue;
    }
    const result = data as
      | { sent?: boolean; skipped?: boolean; reason?: string; error?: string }
      | null;
    if (result?.sent) {
      success += 1;
    } else if (result?.skipped) {
      skipped += 1;
    } else if (result?.error) {
      failure += 1;
      warnings.push(safeAdminWarning(`push_failed:${result.error}`));
    } else {
      skipped += 1;
    }
  }

  return { success, failure, skipped, warnings };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { admin, supabase } = auth;

  const { id } = await params;
  const platformId = id;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Confirm it exists before doing any work. Also fetches baseline so
  // future audit improvements (before/after diff) can extend the payload.
  const { data: existing, error: fetchError } = await supabase
    .from("platforms")
    .select("id,label,is_active")
    .eq("id", platformId)
    .maybeSingle();

  if (fetchError || !existing) {
    if (fetchError) {
      safeAdminErrorLog("admin_platform_fetch_failed", fetchError, {
        operation: "platform_update",
      });
    }
    return NextResponse.json({ error: "Platform not found" }, { status: 404 });
  }
  const previousPlatform = existing as PlatformRow;

  const updates: Record<string, unknown> = {};

  if (typeof body.label === "string") {
    const label = body.label.trim();
    if (!label || label.length > 60) {
      return NextResponse.json(
        { error: "label must be 1-60 chars" },
        { status: 400 },
      );
    }
    updates.label = label;
  }

  if (typeof body.category === "string") {
    if (!VALID_CATEGORIES.includes(body.category as Category)) {
      return NextResponse.json(
        { error: `category must be one of: ${VALID_CATEGORIES.join(", ")}` },
        { status: 400 },
      );
    }
    updates.category = body.category;
  }

  if ("default_monthly_price" in body) {
    const price = Number(body.default_monthly_price);
    if (!Number.isInteger(price) || price < 1 || price > 100000) {
      return NextResponse.json(
        { error: "default_monthly_price must be an integer 1-100000" },
        { status: 400 },
      );
    }
    updates.default_monthly_price = price;
  }

  if (typeof body.brand_color === "string") {
    const color = body.brand_color.trim();
    if (!HEX_RE.test(color)) {
      return NextResponse.json(
        { error: "brand_color must be a hex color like #1ED760" },
        { status: 400 },
      );
    }
    updates.brand_color = color;
  }

  if (typeof body.brand_initials === "string") {
    const initials = body.brand_initials.trim().toUpperCase();
    if (!initials || initials.length < 1 || initials.length > 3) {
      return NextResponse.json(
        { error: "brand_initials must be 1-3 characters" },
        { status: 400 },
      );
    }
    updates.brand_initials = initials;
  }

  if (typeof body.is_active === "boolean") {
    updates.is_active = body.is_active;
  }

  if (typeof body.display_order === "number") {
    if (!Number.isInteger(body.display_order)) {
      return NextResponse.json(
        { error: "display_order must be an integer" },
        { status: 400 },
      );
    }
    updates.display_order = body.display_order;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No fields to update" },
      { status: 400 },
    );
  }

  const previousActive = normalizedActive(previousPlatform);
  const requestedActive =
    typeof body.is_active === "boolean" ? body.is_active : null;
  const hasStatusTransition =
    requestedActive !== null && requestedActive !== previousActive;
  const transition: Transition | null = hasStatusTransition
    ? requestedActive
      ? "activated"
      : "deactivated"
    : null;

  const { data, error } = await supabase
    .from("platforms")
    .update(updates)
    .eq("id", platformId)
    .select()
    .single();

  if (error) {
    const correlationId = safeAdminErrorLog("admin_platform_update_failed", error, {
      operation: "platform_update",
    });
    return adminErrorResponse("Platform could not be updated.", 500, {
      correlationId,
    });
  }

  const updatedPlatform = data as PlatformRow;
  const nextActive = normalizedActive(updatedPlatform);
  let notificationSummary: PlatformNotificationSummary = {
    ...EMPTY_SUMMARY,
    transition,
    warnings: [],
  };

  if (transition) {
    const kind: PlatformNotificationKind =
      transition === "deactivated"
        ? "platform_deactivated"
        : "platform_activated";
    const eventId = [
      "platform",
      platformId,
      previousActive ? "active" : "inactive",
      nextActive ? "active" : "inactive",
      Date.now(),
    ].join(":");
    const { recipients, warnings: recipientWarnings } =
      await collectPlatformRecipients(supabase, platformId, transition);
    const insertResult = await insertPlatformNotifications({
      supabase,
      kind,
      platform: updatedPlatform,
      recipients,
      previousActive,
      nextActive,
      eventId,
    });
    const pushResult = await sendPlatformPushes({
      supabase,
      kind,
      platform: updatedPlatform,
      recipients,
      previousActive,
      nextActive,
      eventId,
    });
    notificationSummary = {
      transition,
      recipient_count: recipients.length,
      notification_inserted_count: insertResult.inserted,
      notification_failed_count: insertResult.failed,
      push_success_count: pushResult.success,
      push_failure_count: pushResult.failure,
      push_skipped_count: pushResult.skipped,
      warnings: [
        ...recipientWarnings,
        ...(insertResult.warning ? [insertResult.warning] : []),
        ...pushResult.warnings,
      ],
    };
  }

  const auditAction: AdminActionType =
    transition === "deactivated"
      ? "platform_deactivated"
      : transition === "activated"
        ? "platform_activated"
        : "platform_updated";

  await logAdminAction(supabase, {
    admin_id: admin.id,
    action_type: auditAction,
    target_resource_id: platformId,
    target_resource_type: "platform",
    payload: {
      changes: updates,
      previous_is_active: previousActive,
      is_active: nextActive,
      notification_summary: notificationSummary,
    },
  });

  return NextResponse.json({
    platform: data,
    notification_summary: notificationSummary,
  });
}
