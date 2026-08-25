// @vitest-environment node
import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { requireAdmin } from "@/lib/admin-auth";
import { dispatchNotificationOutbox } from "@/lib/notification-outbox";
import { logAdminAction } from "@/lib/admin-actions";

vi.mock("@/lib/admin-auth", () => ({ requireAdmin: vi.fn() }));
vi.mock("@/lib/notification-outbox", () => ({
  dispatchNotificationOutbox: vi.fn(),
}));
vi.mock("@/lib/admin-actions", () => ({ logAdminAction: vi.fn() }));

const requireAdminMock = vi.mocked(requireAdmin);
const dispatchMock = vi.mocked(dispatchNotificationOutbox);
const logMock = vi.mocked(logAdminAction);
const rpc = vi.fn();
const serviceClient = {};

function request(body: unknown) {
  return new NextRequest(
    "http://localhost/admin/api/platform-requests/request-1/reject",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

describe("platform request rejection route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it("invokes exactly one authoritative RPC", async () => {
    rpc.mockResolvedValue({
      data: { request_id: "request-1", user_id: "user-1", status: "rejected" },
      error: null,
    });
    const response = await POST(
      request({
        user_visible_rejection_message: "  No shareable plan exists.  ",
        admin_internal_note: "checked provider terms",
      }),
      { params: Promise.resolve({ id: "request-1" }) },
    );

    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("admin_reject_platform_request", {
      p_request_id: "request-1",
      p_user_message: "No shareable plan exists.",
      p_admin_note: "checked provider terms",
    });
    expect(logMock).toHaveBeenCalledTimes(1);
    expect(logMock.mock.calls[0][1]).toMatchObject({
      admin_id: "admin-1",
      action_type: "platform_request_rejected",
      target_user_id: "user-1",
      target_resource_id: "request-1",
      target_resource_type: "platform_request",
    });
  });

  it("requires a user-visible message before touching the database", async () => {
    const response = await POST(
      request({ user_visible_rejection_message: "   " }),
      { params: Promise.resolve({ id: "request-1" }) },
    );
    expect(response.status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("maps a missing request to 404", async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { message: "PLATFORM_REQUEST_NOT_FOUND" },
    });
    const response = await POST(
      request({ user_visible_rejection_message: "No." }),
      { params: Promise.resolve({ id: "request-1" }) },
    );
    expect(response.status).toBe(404);
    expect(dispatchMock).not.toHaveBeenCalled();
  });

  it("returns requireAdmin rejection without invoking the RPC", async () => {
    requireAdminMock.mockResolvedValue({
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    });
    const response = await POST(
      request({ user_visible_rejection_message: "No." }),
      { params: Promise.resolve({ id: "request-1" }) },
    );
    expect(response.status).toBe(403);
    expect(rpc).not.toHaveBeenCalled();
  });
});
