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

const VALID_BODY = {
  platform_id: "disney_hotstar",
  label: "Disney+ Hotstar",
  category: "video",
  default_monthly_price: 299,
  brand_color: "#0F766E",
  brand_initials: "DH",
  display_order: 0,
  admin_internal_note: "verified family plan exists",
};

function request(body: unknown) {
  return new NextRequest(
    "http://localhost/admin/api/platform-requests/request-1/approve",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

describe("platform request approval route", () => {
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

  it("invokes exactly one authoritative RPC with normalised arguments", async () => {
    rpc.mockResolvedValue({
      data: {
        request_id: "request-1",
        user_id: "user-1",
        status: "approved",
        siblings_approved: 2,
      },
      error: null,
    });

    const response = await POST(
      request({ ...VALID_BODY, platform_id: "Disney_Hotstar", brand_initials: "dh" }),
      { params: Promise.resolve({ id: "request-1" }) },
    );

    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("admin_approve_platform_request", {
      p_request_id: "request-1",
      p_platform_id: "disney_hotstar",
      p_label: "Disney+ Hotstar",
      p_category: "video",
      p_default_monthly_price: 299,
      p_brand_color: "#0F766E",
      p_brand_initials: "DH",
      p_display_order: 0,
      p_admin_note: "verified family plan exists",
    });
  });

  it("records the audit entry with the sibling count", async () => {
    rpc.mockResolvedValue({
      data: { user_id: "user-1", siblings_approved: 3, reactivated: false },
      error: null,
    });

    await POST(request(VALID_BODY), {
      params: Promise.resolve({ id: "request-1" }),
    });

    expect(logMock).toHaveBeenCalledTimes(1);
    expect(logMock.mock.calls[0][1]).toMatchObject({
      admin_id: "admin-1",
      action_type: "platform_request_approved",
      target_user_id: "user-1",
      target_resource_id: "request-1",
      target_resource_type: "platform_request",
      payload: { platform_id: "disney_hotstar", siblings_approved: 3 },
    });
  });

  it("rejects an incomplete body before touching the database", async () => {
    const response = await POST(
      request({ ...VALID_BODY, brand_color: "" }),
      { params: Promise.resolve({ id: "request-1" }) },
    );
    expect(response.status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("maps a taken slug to a stable conflict response", async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { message: "PLATFORM_REQUEST_SLUG_TAKEN" },
    });
    const response = await POST(request(VALID_BODY), {
      params: Promise.resolve({ id: "request-1" }),
    });
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      code: "PLATFORM_REQUEST_SLUG_TAKEN",
    });
    expect(dispatchMock).not.toHaveBeenCalled();
  });

  it("maps an already-decided request to a conflict response", async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { message: "PLATFORM_REQUEST_ALREADY_DECIDED" },
    });
    const response = await POST(request(VALID_BODY), {
      params: Promise.resolve({ id: "request-1" }),
    });
    expect(response.status).toBe(409);
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
    const response = await POST(request(VALID_BODY), {
      params: Promise.resolve({ id: "request-1" }),
    });
    expect(response.status).toBe(200);
  });

  it("returns requireAdmin rejection without invoking the RPC", async () => {
    requireAdminMock.mockResolvedValue({
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    });
    const response = await POST(request(VALID_BODY), {
      params: Promise.resolve({ id: "request-1" }),
    });
    expect(response.status).toBe(403);
    expect(rpc).not.toHaveBeenCalled();
  });
});
