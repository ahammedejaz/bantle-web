// Browser-side Supabase client for the admin sign-in flow.
//
// Unlike lib/supabase.ts (which is used by /reset-password and
// intentionally does NOT persist sessions), this client persists
// the session via cookies so the admin stays signed in across page
// loads. The cookies are read by middleware and server components
// to gate /admin/* routes.
//
// This client is only ever used inside /admin/* client components.

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export function createAdminBrowserSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY " +
        "is not configured in Vercel.",
    );
  }

  return createBrowserClient(url, anonKey);
}
