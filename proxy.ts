import { type NextRequest, NextResponse } from "next/server";
import { createRouteSupabase } from "@/lib/admin-supabase-route";
import { isActiveAdmin, hasAdminAssurance } from "@/lib/admin-access";
import { contentSecurityPolicy } from "@/lib/content-security-policy";

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = contentSecurityPolicy(nonce, process.env.NODE_ENV !== "production");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  let response = NextResponse.next({ request: { headers: requestHeaders } });
  const finish = (result: NextResponse) => {
    result.headers.set("Content-Security-Policy", csp);
    // Per-request nonces and authenticated responses must never be cached/shared.
    result.headers.set("Cache-Control", "private, no-store");
    if (result !== response) {
      for (const cookie of response.cookies.getAll()) result.cookies.set(cookie);
    }
    return result;
  };
  const pathname = request.nextUrl.pathname;
  if (pathname !== "/admin" && !pathname.startsWith("/admin/")) return finish(response);

  const supabase = createRouteSupabase(request, response);
  const { data: { user }, error } = await supabase.auth.getUser();
  const login = pathname === "/admin/login";
  const api = pathname.startsWith("/admin/api/");
  if (error || !user) {
    return finish(login ? response : api
      ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      : NextResponse.redirect(new URL("/admin/login", request.url)));
  }
  const { data: profile } = await supabase.from("profiles")
    .select("is_admin,deleted_at,permanently_banned,banned_until")
    .eq("id", user.id).maybeSingle();
  if (!isActiveAdmin(profile)) return finish(login ? response : api
    ? NextResponse.json({ error: "Forbidden" }, { status: 403 })
    : NextResponse.redirect(new URL("/", request.url)));

  const aal2 = await hasAdminAssurance(supabase);
  if (!aal2 && pathname !== "/admin/mfa") return finish(api
    ? NextResponse.json({ error: "Multi-factor authentication required.", code: "MFA_REQUIRED" }, { status: 403 })
    : NextResponse.redirect(new URL("/admin/mfa", request.url)));
  if (aal2 && (login || pathname === "/admin/mfa")) return finish(NextResponse.redirect(new URL("/admin", request.url)));
  // Forward refreshed cookies to server components as well as to the browser.
  requestHeaders.set("cookie", request.headers.get("cookie") ?? "");
  const refreshed = NextResponse.next({ request: { headers: requestHeaders } });
  for (const cookie of response.cookies.getAll()) refreshed.cookies.set(cookie);
  response = refreshed;
  return finish(response);
}
export const config = {
  // Only framework asset directories and exact asset endpoints are excluded.
  // A dynamic parameter (or 404 page) may legitimately end in .png/.svg.
  matcher: ["/((?!_next/(?:static|image)(?:/|$)|(?:icon\\.png|apple-icon\\.png|og\\.png|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|llms\\.txt|brand/bantle-(?:mark|icon)\\.png)$).*)"],
};
