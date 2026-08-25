// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { validateSameOriginMutationRequest } from "../admin-auth";

describe("same-origin mutation protection", () => {
  it("rejects a cross-origin admin mutation", () => {
    const request = new NextRequest("https://admin.example.test/admin/api/action", {
      method: "POST",
      headers: { origin: "https://attacker.example.test" },
    });
    expect(validateSameOriginMutationRequest(request)?.status).toBe(403);
  });

  it("allows a matching origin", () => {
    const request = new NextRequest("https://admin.example.test/admin/api/action", {
      method: "POST",
      headers: { origin: "https://admin.example.test" },
    });
    expect(validateSameOriginMutationRequest(request)).toBeNull();
  });
});
