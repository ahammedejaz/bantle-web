import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getInternalFunctionHeaders,
} from "@/lib/admin-internal-functions";
import {
  safeAdminErrorCode,
  safeAdminErrorLog,
  safeAdminWarning,
} from "@/lib/admin-safe-errors";

export type TrustStatusNotificationKind =
  | "identity_verification_approved"
  | "identity_verification_rejected"
  | "identity_reverification_required"
  | "name_change_approved"
  | "name_change_rejected"
  | "trust_badge_awarded"
  | "trust_badge_revoked";

type SafeNotificationPayload = Record<string, string | number | boolean | null>;

type TrustNotificationSummary = {
  notification_inserted: boolean;
  push_sent: boolean;
  push_skipped: boolean;
  warnings: string[];
};

const EMPTY_SUMMARY: TrustNotificationSummary = {
  notification_inserted: false,
  push_sent: false,
  push_skipped: false,
  warnings: [],
};

export async function notifyTrustStatusUpdate(args: {
  supabase: SupabaseClient;
  userId: string;
  kind: TrustStatusNotificationKind;
  payload?: SafeNotificationPayload;
  operation: string;
}): Promise<TrustNotificationSummary> {
  const summary: TrustNotificationSummary = {
    ...EMPTY_SUMMARY,
    warnings: [],
  };
  const payload = args.payload ?? {};

  const { error: notificationError } = await args.supabase
    .from("notifications")
    .insert({
      user_id: args.userId,
      kind: args.kind,
      payload,
    });

  if (notificationError) {
    summary.warnings.push(
      safeAdminWarning(
        `notification_failed:${safeAdminErrorCode(notificationError)}`,
      ),
    );
    safeAdminErrorLog("admin_trust_notification_insert_failed", notificationError, {
      operation: args.operation,
      notification_kind: args.kind,
    });
  } else {
    summary.notification_inserted = true;
  }

  let internalHeaders: Record<string, string>;
  try {
    internalHeaders = getInternalFunctionHeaders();
  } catch (error) {
    summary.warnings.push(safeAdminWarning("push_failed:config_error"));
    safeAdminErrorLog("admin_trust_notification_push_config_failed", error, {
      operation: args.operation,
      notification_kind: args.kind,
    });
    return summary;
  }

  const { data, error: pushError } = await args.supabase.functions.invoke(
    "send_push_notification",
    {
      headers: internalHeaders,
      body: {
        recipient_id: args.userId,
        kind: args.kind,
        data: payload,
      },
    },
  );

  if (pushError) {
    summary.warnings.push(
      safeAdminWarning(`push_failed:${safeAdminErrorCode(pushError)}`),
    );
    safeAdminErrorLog("admin_trust_notification_push_failed", pushError, {
      operation: args.operation,
      notification_kind: args.kind,
    });
    return summary;
  }

  const pushResult = data as
    | { sent?: boolean; skipped?: boolean; reason?: string; error?: string }
    | null;
  if (pushResult?.sent) {
    summary.push_sent = true;
  } else if (pushResult?.skipped) {
    summary.push_skipped = true;
  } else if (pushResult?.error) {
    summary.warnings.push(safeAdminWarning(`push_failed:${pushResult.error}`));
  } else {
    summary.push_skipped = true;
  }

  return summary;
}
