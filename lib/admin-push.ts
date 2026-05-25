// Helper for admin-triggered push notifications.
// Uses Expo's push API directly via HTTPS — no SDK needed for the
// small surface we use. Reads the recipient's push_token from
// profiles via the service-role client passed by the caller.
//
// IMPORTANT: This is for admin-triggered transactional pushes only
// (warnings, ban notifications). Re-engagement pushes are out of
// scope permanently per ADMIN_PANEL_PLAN.md Section 2.

import type { SupabaseClient } from "@supabase/supabase-js";

interface SendPushArgs {
  supabase: SupabaseClient;
  recipientUserId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

type SendPushResult =
  | { sent: true }
  | { sent: false; reason: string };

export async function sendAdminPush(
  args: SendPushArgs,
): Promise<SendPushResult> {
  const { supabase, recipientUserId, title, body, data } = args;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("push_token")
    .eq("id", recipientUserId)
    .maybeSingle();

  if (error) {
    return { sent: false, reason: "profile_fetch_failed" };
  }
  if (!profile?.push_token) {
    return { sent: false, reason: "Recipient has no push token registered" };
  }

  // Channel 'moderation' is registered by the mobile app at startup
  // (see ~/Documents/GitHub/bantle/lib/push.ts registerAndroidChannels).
  // HIGH importance + sound + vibration; surfaces as a heads-up banner.
  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: profile.push_token,
      title,
      body,
      data: data ?? {},
      priority: "high",
      channelId: "moderation",
    }),
  });

  if (!response.ok) {
    return { sent: false, reason: `expo_http_${response.status}` };
  }

  const result = (await response.json()) as {
    data?: { status?: string; message?: string };
  };
  if (result?.data?.status === "error") {
    return { sent: false, reason: "expo_error" };
  }

  return { sent: true };
}
