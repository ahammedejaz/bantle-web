// @vitest-environment node
import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { requireAdmin } from "@/lib/admin-auth";
import { dispatchNotificationOutbox } from "@/lib/notification-outbox";

vi.mock("@/lib/admin-auth", () => ({ requireAdmin: vi.fn() }));
vi.mock("@/lib/notification-outbox", () => ({
  dispatchNotificationOutbox: vi.fn(),
}));

const requireAdminMock = vi.mocked(requireAdmin);
const dispatchMock = vi.mocked(dispatchNotificationOutbox);
const rpc = vi.fn();
const serviceClient = {};

function request(body: unknown) {
  return new NextRequest(
    "http://localhost/admin/api/identity-verifications/request-1/approve",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

describe("identity approval route", () => {
  beforeEach(() => {
    requireAdminMock.mockResolvedValue({
      admin: { id: "admin-1", email: "admin@example.test" },
      userClient: { rpc } as never,
      supabase: serviceClient as never,
    });
    dispatchMock.mockResolvedValue({
      claimed: 1,
      completed: 1,
      retryableFailed: 0,
      dispatcherErrors: 0,
    });
  });

  it("invokes exactly one authenticated authoritative RPC", async () => {
    rpc.mockResolvedValue({
      data: { request_id: "request-1", status: "approved" },
      error: null,
    });
    const response = await POST(request({ admin_internal_note: "reviewed" }), {
      params: Promise.resolve({ id: "request-1" }),
    });

    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith(
      "admin_approve_identity_verification",
      { p_request_id: "request-1", p_admin_note: "reviewed" },
    );
  });

  it("maps a feature-disabled database decision to a stable response", async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { message: "IDENTITY_ADMIN_REVIEW_DISABLED" },
    });
    const response = await POST(request({}), {
      params: Promise.resolve({ id: "request-1" }),
    });
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      code: "IDENTITY_ADMIN_REVIEW_DISABLED",
    });
    expect(dispatchMock).not.toHaveBeenCalled();
  });

  it("does not undo a committed RPC when push delivery is deferred", async () => {
    rpc.mockResolvedValue({
      data: { request_id: "request-1", status: "approved" },
      error: null,
    });
    dispatchMock.mockResolvedValue({
      claimed: 1,
      completed: 0,
      retryableFailed: 1,
      dispatcherErrors: 0,
    });
    const response = await POST(request({}), {
      params: Promise.resolve({ id: "request-1" }),
    });
    expect(response.status).toBe(200);
  });

  it("returns requireAdmin rejection without invoking the RPC", async () => {
    requireAdminMock.mockResolvedValue({
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    });
    const response = await POST(request({}), {
      params: Promise.resolve({ id: "request-1" }),
    });
    expect(response.status).toBe(403);
    expect(rpc).not.toHaveBeenCalled();
  });
});
