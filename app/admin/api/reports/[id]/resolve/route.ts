// POST /admin/api/reports/[id]/resolve — take action on a report.
// Body: { action: 'resolve' | 'dismiss' | 'warn' | 'ban_temp' | 'ban_perm',
//         reason?: string (REQUIRED for warn/ban_*) }
//
// Side effects:
//   resolve   — marks report resolved, no user-facing action
//   dismiss   — marks report dismissed
//   warn      — sends moderation push, marks report resolved
//   ban_temp  — sets profile.banned_until = now() + 7 days,
//               sends push, marks report resolved
//   ban_perm  — soft-deletes the reported user (existing 7-day
//               cron hard-deletes), sends push, marks report resolved
//
// Every state-changing action writes an admin_actions row AFTER the
// primary action succeeds.

import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  logAdminAction,
  type AdminActionType,
} from "@/lib/admin-actions";
import { sendAdminPush } from "@/lib/admin-push";

const VALID_ACTIONS = new Set([
  "resolve",
  "dismiss",
  "warn",
  "ban_temp",
  "ban_perm",
]);

const TEMP_BAN_DAYS = 7;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { admin, supabase } = auth;

  const reportId = params.id;

  let body: { action?: string; reason?: string };
  try {
    body = (await request.json()) as { action?: string; reason?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = body.action ?? "";
  const reason = (body.reason ?? "").trim() || null;

  if (!VALID_ACTIONS.has(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  if (["warn", "ban_temp", "ban_perm"].includes(action) && !reason) {
    return NextResponse.json(
      { error: "Reason is required for this action" },
      { status: 400 },
    );
  }

  const { data: report, error: reportError } = await supabase
    .from("user_reports")
    .select("id, reported_id, status")
    .eq("id", reportId)
    .maybeSingle();

  if (reportError || !report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  if (report.status !== "open") {
    return NextResponse.json(
      { error: "Report already resolved" },
      { status: 409 },
    );
  }

  const reportedId = report.reported_id as string | null;
  let resolutionAction = "none";
  let auditActionType: AdminActionType;

  switch (action) {
    case "resolve":
      resolutionAction = "none";
      auditActionType = "report_resolved";
      break;

    case "dismiss":
      resolutionAction = "dismissed";
      auditActionType = "report_dismissed";
      break;

    case "warn": {
      if (reportedId) {
        const pushResult = await sendAdminPush({
          supabase,
          recipientUserId: reportedId,
          title: "Account warning",
          body: "Your account received a moderation warning. Please review the community guidelines.",
          data: { type: "moderation_warning" },
        });
        if (!pushResult.sent) {
          console.warn("[admin warn] push failed:", pushResult.reason);
        }
      }
      resolutionAction = "warned";
      auditActionType = "user_warned";
      break;
    }

    case "ban_temp": {
      if (!reportedId) {
        return NextResponse.json(
          { error: "Cannot ban — reported user record missing" },
          { status: 400 },
        );
      }
      const bannedUntil = new Date();
      bannedUntil.setDate(bannedUntil.getDate() + TEMP_BAN_DAYS);
      const { error: banError } = await supabase
        .from("profiles")
        .update({
          banned_until: bannedUntil.toISOString(),
          banned_reason: reason,
          banned_by: admin.id,
        })
        .eq("id", reportedId);
      if (banError) {
        return NextResponse.json(
          { error: `Ban failed: ${banError.message}` },
          { status: 500 },
        );
      }
      await sendAdminPush({
        supabase,
        recipientUserId: reportedId,
        title: "Account suspended",
        body: `Your Bantle account has been suspended for ${TEMP_BAN_DAYS} days due to a community guidelines violation.`,
        data: {
          type: "ban_temp",
          banned_until: bannedUntil.toISOString(),
        },
      });
      resolutionAction = "banned_temp";
      auditActionType = "user_banned";
      break;
    }

    case "ban_perm": {
      if (!reportedId) {
        return NextResponse.json(
          { error: "Cannot ban — reported user record missing" },
          { status: 400 },
        );
      }
      const { error: deleteError } = await supabase
        .from("profiles")
        .update({
          deleted_at: new Date().toISOString(),
          banned_reason: reason,
          banned_by: admin.id,
        })
        .eq("id", reportedId);
      if (deleteError) {
        return NextResponse.json(
          { error: `Soft-delete failed: ${deleteError.message}` },
          { status: 500 },
        );
      }
      await sendAdminPush({
        supabase,
        recipientUserId: reportedId,
        title: "Account removed",
        body: "Your Bantle account has been removed due to a community guidelines violation.",
        data: { type: "ban_perm" },
      });
      resolutionAction = "banned_perm";
      auditActionType = "user_soft_deleted";
      break;
    }

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from("user_reports")
    .update({
      status: action === "dismiss" ? "dismissed" : "resolved",
      resolved_at: new Date().toISOString(),
      resolved_by: admin.id,
      resolution_action: resolutionAction,
    })
    .eq("id", reportId);

  if (updateError) {
    return NextResponse.json(
      { error: `Report update failed: ${updateError.message}` },
      { status: 500 },
    );
  }

  await logAdminAction(supabase, {
    admin_id: admin.id,
    action_type: auditActionType,
    target_user_id: reportedId,
    target_resource_id: reportId,
    target_resource_type: "user_report",
    reason,
    payload: { action, resolution_action: resolutionAction },
  });

  return NextResponse.json({ success: true });
}
