// requireAdmin — server-side helper used at the top of every admin
// API route. Returns the admin user info plus a service-role
// Supabase client, OR a NextResponse with the appropriate error.
//
// Usage:
//   export async function POST(request: NextRequest) {
//     const result = await requireAdmin(request);
//     if ("error" in result) return result.error;
//     const { admin, supabase } = result;
//     // ...privileged work
//   }

import { type NextRequest, NextResponse } from "next/server";
import { createRouteSupabase } from "./admin-supabase-route";
import { createServiceRoleSupabase } from "./admin-supabase-server";

type RequireAdminSuccess = {
  admin: { id: string; email: string };
  /** Authenticated user-context client for RPCs that bind to auth.uid(). */
  userClient: ReturnType<typeof createRouteSupabase>;
  /** Service client is reserved for post-commit dispatch/read operations. */
  supabase: ReturnType<typeof createServiceRoleSupabase>;
};

type RequireAdminFailure = {
  error: NextResponse;
};

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function validateSameOriginMutationRequest(
  request: NextRequest,
): NextResponse | null {
  if (!MUTATION_METHODS.has(request.method.toUpperCase())) {
    return null;
  }

  const expectedOrigin = request.nextUrl.origin;
  const origin = request.headers.get("origin");
  if (origin) {
    return originMatches(origin, expectedOrigin)
      ? null
      : invalidOriginResponse();
  }

  const referer = request.headers.get("referer");
  if (referer) {
    return originMatches(referer, expectedOrigin)
      ? null
      : invalidOriginResponse();
  }

  if (process.env.NODE_ENV === "production") {
    return invalidOriginResponse();
  }

  return null;
}

export async function requireAdmin(
  request: NextRequest,
): Promise<RequireAdminSuccess | RequireAdminFailure> {
  const originError = validateSameOriginMutationRequest(request);
  if (originError) {
    return { error: originError };
  }

  const response = NextResponse.next({ request });
  const userClient = createRouteSupabase(request, response);

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      ),
    };
  }

  const { data: profile, error: profileError } = await userClient
    .from("profiles")
    .select("is_admin, email, deleted_at, permanently_banned, banned_until")
    .eq("id", user.id)
    .maybeSingle();

  const activelyBanned = Boolean(
    profile?.banned_until && new Date(profile.banned_until).getTime() > Date.now(),
  );
  if (
    profileError ||
    !profile?.is_admin ||
    profile.deleted_at !== null ||
    profile.permanently_banned ||
    activelyBanned
  ) {
    return {
      error: NextResponse.json(
        { error: "Forbidden" },
        { status: 403 },
      ),
    };
  }

  return {
    admin: { id: user.id, email: profile.email ?? user.email ?? "" },
    userClient,
    supabase: createServiceRoleSupabase(),
  };
}

function originMatches(value: string, expectedOrigin: string): boolean {
  try {
    return new URL(value).origin === expectedOrigin;
  } catch {
    return false;
  }
}

function invalidOriginResponse(): NextResponse {
  return NextResponse.json(
    { error: "Invalid request origin." },
    { status: 403 },
  );
}
