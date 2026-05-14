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
  supabase: ReturnType<typeof createServiceRoleSupabase>;
};

type RequireAdminFailure = {
  error: NextResponse;
};

export async function requireAdmin(
  request: NextRequest,
): Promise<RequireAdminSuccess | RequireAdminFailure> {
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
    .select("is_admin, email")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile?.is_admin) {
    return {
      error: NextResponse.json(
        { error: "Forbidden" },
        { status: 403 },
      ),
    };
  }

  return {
    admin: { id: user.id, email: profile.email ?? user.email ?? "" },
    supabase: createServiceRoleSupabase(),
  };
}
