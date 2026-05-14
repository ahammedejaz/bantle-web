// Admin route gating. Runs on every request matching /admin/*.
//
// Flow:
//   1. If signed out, redirect to /admin/login (unless already there).
//   2. If signed in, check profiles.is_admin for the current user.
//   3. If not admin, redirect to / (no error message, no surface).
//   4. If admin, pass through.
//
// The is_admin check happens here in middleware so that even if a
// non-admin somehow lands on /admin/*, they can't see a single
// admin pixel before being redirected.

import { type NextRequest, NextResponse } from "next/server";
import { createRouteSupabase } from "@/lib/admin-supabase-route";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Only gate /admin/* routes.
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const response = NextResponse.next({ request });
  const supabase = createRouteSupabase(request, response);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Login page handling: signed-in admins should bounce to /admin.
  // Signed-in non-admins and signed-out users should see the login.
  if (pathname === "/admin/login") {
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.is_admin) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
    return response;
  }

  // All other /admin/* routes require admin status.
  if (!user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    // Security through obscurity: don't reveal admin panel exists.
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
