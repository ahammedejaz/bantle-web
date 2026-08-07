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

const rpc = vi.fn();
const requireAdminMock = vi.mocked(requireAdmin);
const dispatchMock = vi.mocked(dispatchNotificationOutbox);

describe("deal termination route", () => {
  beforeEach(() => {
    requireAdminMock.mockResolvedValue({
      admin: { id: "admin-1", email: "admin@example.test" },
      userClient: { rpc } as never,
      supabase: {} as never,
    });
    dispatchMock.mockResolvedValue({
      claimed: 2,
      completed: 2,
      retryableFailed: 0,
      dispatcherErrors: 0,
    });
  });

  it("delegates lifecycle, audit, inbox, and message writes to one RPC", async () => {
    rpc.mockResolvedValue({
      data: {
        deal_id: "deal-1",
        status: "cancelled",
        terminated_at: "2026-08-06T00:00:00Z",
        notification_count: 2,
        system_message_created: true,
        idempotent: false,
      },
      error: null,
    });
    const request = new NextRequest(
      "http://localhost/admin/api/deals/deal-1/terminate",
      {
        method: "POST",
        body: JSON.stringify({ reason: "synthetic terminate" }),
      },
    );
    const response = await POST(request, {
      params: Promise.resolve({ id: "deal-1" }),
    });
    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("admin_terminate_deal", {
      p_deal_id: "deal-1",
      p_reason: "synthetic terminate",
    });
  });
});
