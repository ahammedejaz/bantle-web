import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Phase 11 — browser-only Supabase client factory for the password
// reset flow. We create the client fresh per call (not as a
// module-level singleton) so that users on shared devices don't
// inherit auth state from previous users.
//
// Uses the ANON key only. The service_role key must NEVER be exposed
// to the browser — it bypasses RLS and has full database access.
//
// Environment variables (configured in Vercel project settings):
//   NEXT_PUBLIC_SUPABASE_URL — public, same URL used by mobile app
//   NEXT_PUBLIC_SUPABASE_ANON_KEY — public anon key

export function createBrowserSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase environment variables are not configured. " +
        "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.",
    );
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
