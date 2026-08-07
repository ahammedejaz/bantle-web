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

function request(body: unknown) {
  return new NextRequest(
    "http://localhost/admin/api/identity-verifications/request-1/reject",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

describe("identity rejection route", () => {
  beforeEach(() => {
    requireAdminMock.mockResolvedValue({
      admin: { id: "admin-1", email: "admin@example.test" },
      userClient: { rpc } as never,
      supabase: {} as never,
    });
    dispatchMock.mockResolvedValue({
      claimed: 1,
      completed: 1,
      retryableFailed: 0,
      dispatcherErrors: 0,
    });
  });

  it("validates input and invokes one authenticated transaction RPC", async () => {
    rpc.mockResolvedValue({
      data: { request_id: "request-1", status: "rejected" },
      error: null,
    });
    const response = await POST(request({
      user_visible_rejection_message: "Please retry with a clearer image.",
      admin_internal_note: "synthetic review note",
    }), { params: Promise.resolve({ id: "request-1" }) });

    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith(
      "admin_reject_identity_verification",
      {
        p_request_id: "request-1",
        p_user_message: "Please retry with a clearer image.",
        p_admin_note: "synthetic review note",
      },
    );
  });

  it("fails closed when review is disabled", async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { message: "IDENTITY_ADMIN_REVIEW_DISABLED" },
    });
    const response = await POST(request({
      user_visible_rejection_message: "Please retry.",
    }), { params: Promise.resolve({ id: "request-1" }) });

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      code: "IDENTITY_ADMIN_REVIEW_DISABLED",
    });
    expect(dispatchMock).not.toHaveBeenCalled();
  });

  it("rejects a missing user-facing reason before the RPC", async () => {
    const response = await POST(request({}), {
      params: Promise.resolve({ id: "request-1" }),
    });
    expect(response.status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects messages that exceed the database contract", async () => {
    const response = await POST(request({
      user_visible_rejection_message: "x".repeat(501),
    }), { params: Promise.resolve({ id: "request-1" }) });
    expect(response.status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("does not invoke the RPC after an admin authorization failure", async () => {
    requireAdminMock.mockResolvedValue({
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    });
    const response = await POST(request({
      user_visible_rejection_message: "Please retry.",
    }), { params: Promise.resolve({ id: "request-1" }) });
    expect(response.status).toBe(403);
    expect(rpc).not.toHaveBeenCalled();
  });
});
