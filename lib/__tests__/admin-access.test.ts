// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { hasAdminAssurance, isActiveAdmin } from "../admin-access";
import type { SupabaseClient } from "@supabase/supabase-js";

describe("admin access", () => {
  const profile = { is_admin: true, deleted_at: null, permanently_banned: false, banned_until: null };
  it("allows only active admins", () => {
    expect(isActiveAdmin(profile)).toBe(true);
    for (const invalid of [null, {}, { ...profile, is_admin: false }, { ...profile, deleted_at: "2026-01-01" }, { ...profile, permanently_banned: true }, { ...profile, banned_until: "2999-01-01" }]) expect(isActiveAdmin(invalid)).toBe(false);
  });
  it("requires verified aal2 claims and fails closed on signature errors", async () => {
    for (const [aal, error, expected] of [["aal1", null, false], ["aal2", null, true], ["aal2", {}, false], [undefined, null, false]] as const) {
      const client = { auth: { getClaims: vi.fn().mockResolvedValue({ data: { claims: { aal } }, error }) } } as unknown as SupabaseClient;
      expect(await hasAdminAssurance(client)).toBe(expected);
    }
  });
});
