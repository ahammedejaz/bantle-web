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

describe("listing close route", () => {
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

  it("delegates all authoritative changes to one RPC", async () => {
    rpc.mockResolvedValue({
      data: {
        listing_id: "listing-1",
        status: "closed",
        closed_at: "2026-08-06T00:00:00Z",
        idempotent: false,
      },
      error: null,
    });
    const request = new NextRequest(
      "http://localhost/admin/api/listings/listing-1/close",
      {
        method: "POST",
        body: JSON.stringify({ reason: "synthetic close" }),
      },
    );
    const response = await POST(request, {
      params: Promise.resolve({ id: "listing-1" }),
    });
    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("admin_close_listing", {
      p_listing_id: "listing-1",
      p_reason: "synthetic close",
    });
  });
});
