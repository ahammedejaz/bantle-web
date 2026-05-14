// Server-side Supabase client that reads/writes cookies for the
// current request. Used in middleware and Route Handlers to check
// whether the request is from a signed-in user, and to verify
// admin status before privileged actions.
//
// Distinct from admin-supabase-server.ts: this client uses the
// anon key + the user's JWT (from cookies). It runs with RLS as
// the user, NOT as service role.

import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

export function createRouteSupabase(
  request: NextRequest,
  response: NextResponse,
): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase env vars not configured.");
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });
}
