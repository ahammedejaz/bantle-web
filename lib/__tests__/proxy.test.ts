// @vitest-environment node
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("../admin-supabase-route", () => ({ createRouteSupabase: mocks.create }));
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { proxy, config } from "../../proxy";
describe("admin proxy and CSP", () => {
  beforeEach(() => vi.clearAllMocks());
  function setup(aal = "aal1", user: object | null = {id:"admin"}) {
    mocks.create.mockImplementation((_request, response) => {
      response.cookies.set("refreshed-test", "yes");
      const query = {select:vi.fn().mockReturnThis(),eq:vi.fn().mockReturnThis(),maybeSingle:vi.fn().mockResolvedValue({data:{is_admin:true,deleted_at:null,permanently_banned:false,banned_until:null}})};
      return {auth:{getUser:vi.fn().mockResolvedValue({data:{user},error:null}),getClaims:vi.fn().mockResolvedValue({data:{claims:{aal}},error:null})},from:vi.fn().mockReturnValue(query)};
    });
  }
  it("redirects AAL1 to MFA, lets MFA render, and denies APIs as JSON", async () => {
    setup();
    const first = await proxy(new NextRequest("https://www.bantle.in/admin"));
    expect(first.headers.get("location")).toBe("https://www.bantle.in/admin/mfa");
    expect(first.cookies.get("refreshed-test")?.value).toBe("yes");
    expect((await proxy(new NextRequest("https://www.bantle.in/admin/mfa"))).headers.get("location")).toBeNull();
    const api = await proxy(new NextRequest("https://www.bantle.in/admin/api/listings"));
    expect(api.status).toBe(403); expect(await api.json()).toHaveProperty("code","MFA_REQUIRED");
  });
  it("redirects verified admins away from challenge and refuses anonymous API access", async () => {
    setup("aal2");
    expect((await proxy(new NextRequest("https://www.bantle.in/admin/mfa"))).headers.get("location")).toBe("https://www.bantle.in/admin");
    setup("aal1",null);
    expect((await proxy(new NextRequest("https://www.bantle.in/admin/api/listings"))).status).toBe(401);
  });
  it("overwrites spoofed nonce headers with a fresh per-request nonce and disables shared caching", async () => {
    const a = await proxy(new NextRequest("https://www.bantle.in/", {headers:{"x-nonce":"attacker"}}));
    const b = await proxy(new NextRequest("https://www.bantle.in/"));
    expect(a.headers.get("content-security-policy")).not.toContain("attacker");
    expect(a.headers.get("content-security-policy")).not.toEqual(b.headers.get("content-security-policy"));
    expect(a.headers.get("cache-control")).toBe("private, no-store");
    expect(a.headers.get("x-middleware-request-x-nonce")).toBeTruthy();
  });
});


describe("actual Next proxy matcher", () => {
  it.each(["/admin/users/synthetic.png", "/admin/users/synthetic.svg", "/unknown.svg", "/favicon.ico", "/icon.png/child", "/brand/unknown.png", "/", "/admin/login"])("matches HTML-shaped or unknown path %s", (url) => {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url })).toBe(true);
  });
  it.each(["/_next/static/chunks/app.js", "/_next/image?url=test&w=32&q=75", "/icon.png", "/apple-icon.png", "/og.png", "/robots.txt", "/sitemap.xml", "/brand/bantle-icon.png", "/brand/bantle-mark.png"])("excludes real static assets %s", (url) => {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url })).toBe(false);
  });
});
