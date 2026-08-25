// logAdminAction — writes a row to admin_actions. Called after
// every state-changing admin operation succeeds.
//
// Errors are swallowed and console.error'd so a primary action
// succeeding doesn't fail just because the audit log write hiccups.
// Phase 1 trade-off: in the rare event of an audit miss, we accept
// the missing row. A monitor on admin_actions table size could
// alert on suspicious gaps later.

import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminActionType =
  | "report_resolved"
  | "report_dismissed"
  | "user_warned"
  | "user_banned"
  | "user_soft_deleted"
  | "user_restored"
  | "platform_created"
  | "platform_updated"
  | "platform_deactivated"
  | "platform_activated"
  | "platform_deleted"
  | "platform_category_created"
  | "platform_category_updated"
  | "platform_category_deactivated"
  | "platform_category_activated"
  | "listing_closed"
  | "deal_terminated"
  | "broadcast_sent"
  | "broadcast_retried"
  | "user_verification_updated"
  | "verification_settings_updated"
  | "deal_reputation_settings_updated"
  | "manual_verification_approved"
  | "manual_verification_revoked"
  | "identity_verification_approved"
  | "identity_verification_rejected"
  | "name_change_approved"
  | "name_change_rejected"
  | "platform_request_approved"
  | "platform_request_rejected";

export interface AdminActionInput {
  admin_id: string;
  action_type: AdminActionType;
  target_user_id?: string | null;
  target_resource_id?: string | null;
  target_resource_type?: string | null;
  reason?: string | null;
  payload?: Record<string, unknown>;
}

export async function logAdminAction(
  supabase: SupabaseClient,
  input: AdminActionInput,
): Promise<void> {
  const { error } = await supabase.from("admin_actions").insert({
    admin_id: input.admin_id,
    action_type: input.action_type,
    target_user_id: input.target_user_id ?? null,
    target_resource_id: input.target_resource_id ?? null,
    target_resource_type: input.target_resource_type ?? null,
    reason: input.reason ?? null,
    payload: input.payload ?? {},
  });

  if (error) {
    console.error("[admin-actions] log write failed:", error);
    // Intentionally do not throw — primary action already succeeded.
  }
}
