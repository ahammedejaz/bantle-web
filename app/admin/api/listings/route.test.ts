// @vitest-environment node
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ auth: vi.fn(), rpc: vi.fn(), from: vi.fn() }));
vi.mock("@/lib/admin-auth", () => ({ requireAdmin: mocks.auth }));
import { GET } from "./route";
describe("admin listings batch summary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ supabase: {from:mocks.from,rpc:mocks.rpc} });
  });
  it("rejects malformed pagination before querying", async () => {
    const response = await GET(new NextRequest("https://www.bantle.in/admin/api/listings?page=Infinity"));
    expect(response.status).toBe(400); expect(mocks.from).not.toHaveBeenCalled();
  });
  it("uses one summary RPC for all listings and preserves active counts", async () => {
    const rows = [{id:"one",monthly_price:1},{id:"two",monthly_price:2}];
    const query = {select:vi.fn().mockReturnThis(),order:vi.fn().mockReturnThis(),range:vi.fn().mockResolvedValue({data:rows,count:2,error:null})};
    mocks.from.mockReturnValue(query);
    mocks.rpc.mockResolvedValue({data:[{listing_id:"one",slots_available:1,pending_deal_count:2,active_deal_count:3},{listing_id:"two",slots_available:0,pending_deal_count:4,active_deal_count:5}],error:null});
    const response = await GET(new NextRequest("https://www.bantle.in/admin/api/listings"));
    expect(response.status).toBe(200);
    expect(mocks.rpc).toHaveBeenCalledExactlyOnceWith("admin_listing_summary",{p_listing_ids:["one","two"]});
    const body = await response.json();
    expect(body.listings[0]).toMatchObject({slots_available:1,pending_deal_count:2,active_deal_count:3});
  });
});
