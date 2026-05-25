// Server-side sign-out. Clears the Supabase session cookie cleanly.
// Called by the logout confirmation dialog. We do this server-side
// rather than client-side because cookie clearing is more reliable
// from a Route Handler — no edge cases with same-site cookie flags
// or hydration mismatches.

import { type NextRequest, NextResponse } from "next/server";
import { validateSameOriginMutationRequest } from "@/lib/admin-auth";
import { createRouteSupabase } from "@/lib/admin-supabase-route";

export async function POST(request: NextRequest) {
  const originError = validateSameOriginMutationRequest(request);
  if (originError) return originError;

  const response = NextResponse.json({ success: true });
  const supabase = createRouteSupabase(request, response);
  await supabase.auth.signOut();
  return response;
}
