// @vitest-environment node
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ create: vi.fn(), service: vi.fn() }));
vi.mock("../admin-supabase-route", () => ({ createRouteSupabase: mocks.create }));
vi.mock("../admin-supabase-server", () => ({ createServiceRoleSupabase: mocks.service }));
import { requireAdmin } from "../admin-auth";

describe("requireAdmin", () => {
  beforeEach(() => vi.clearAllMocks());
  function setup(aal: string, active = true, user = true) {
    const result = { data: { is_admin: active, deleted_at: null, permanently_banned: false, banned_until: null, email: "admin@example.test" }, error: null };
    const query = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue(result) };
    mocks.create.mockReturnValue({ auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: user ? { id: "admin" } : null }, error: null }),
      getClaims: vi.fn().mockResolvedValue({ data: { claims: { aal } }, error: null }),
    }, from: vi.fn().mockReturnValue(query) });
  }
  it("never creates a service client for AAL1, non-admin, or signed-out sessions", async () => {
    for (const [aal, active, user, status] of [["aal1",true,true,403],["aal2",false,true,403],["aal2",true,false,401]] as const) {
      setup(aal, active, user);
      const result = await requireAdmin(new NextRequest("https://www.bantle.in/admin/api/listings"));
      expect("error" in result && result.error.status).toBe(status);
      expect(mocks.service).not.toHaveBeenCalled();
    }
  });
  it("allows verified AAL2 active admin", async () => {
    setup("aal2");
    expect(await requireAdmin(new NextRequest("https://www.bantle.in/admin/api/listings"))).toHaveProperty("admin.id", "admin");
    expect(mocks.service).toHaveBeenCalledOnce();
  });
});
