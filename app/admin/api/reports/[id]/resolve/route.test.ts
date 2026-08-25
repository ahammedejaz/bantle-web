// @vitest-environment node
import { NextRequest } from "next/server";
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
  return new NextRequest("http://localhost/admin/api/reports/report-1/resolve", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("report resolution route", () => {
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

  it("validates action-specific reason before calling SQL", async () => {
    const response = await POST(request({ action: "ban_temp" }), {
      params: Promise.resolve({ id: "report-1" }),
    });
    expect(response.status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("invokes one transactional moderation RPC", async () => {
    rpc.mockResolvedValue({
      data: { report_id: "report-1", status: "actioned" },
      error: null,
    });
    const response = await POST(
      request({ action: "ban_temp", reason: "synthetic reason" }),
      { params: Promise.resolve({ id: "report-1" }) },
    );
    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("admin_resolve_report", {
      p_report_id: "report-1",
      p_action: "ban_temp",
      p_reason: "synthetic reason",
    });
  });

  it("accepts an idempotent retry result", async () => {
    rpc.mockResolvedValue({
      data: { report_id: "report-1", status: "actioned", idempotent: true },
      error: null,
    });
    const response = await POST(
      request({ action: "warn", reason: "synthetic reason" }),
      { params: Promise.resolve({ id: "report-1" }) },
    );
    expect(response.status).toBe(200);
  });
});
