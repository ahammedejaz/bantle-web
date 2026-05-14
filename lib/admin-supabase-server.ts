// Server-only Supabase client for admin API routes.
//
// Uses the service role key. NEVER import this from a "use client"
// component or any file imported by one. The runtime check below
// throws immediately if this module is loaded in a browser context.
//
// SUPABASE_SERVICE_ROLE_KEY is set in Vercel as a private (non-public)
// environment variable. It MUST NOT have a NEXT_PUBLIC_ prefix —
// public env vars are inlined into the client bundle.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Defensive runtime check — fails loudly if a future refactor
// accidentally imports this from a client component.
if (typeof window !== "undefined") {
  throw new Error(
    "lib/admin-supabase-server.ts loaded in browser context. " +
      "This file must only be imported from server components or " +
      "API routes. Check your import graph.",
  );
}

export function createServiceRoleSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured. Add it to Vercel " +
        "as a private environment variable (no NEXT_PUBLIC_ prefix).",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
