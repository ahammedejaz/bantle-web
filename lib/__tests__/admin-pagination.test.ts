import { describe, it, expect } from "vitest";
import { adminPagination } from "../admin-pagination";
describe("bounded admin pagination", () => {
  it("defaults and computes finite offsets", () => {
    expect(adminPagination(new URLSearchParams())).toEqual({page:1,pageSize:20,offset:0});
    expect(adminPagination(new URLSearchParams("page=2&page_size=50"))).toEqual({page:2,pageSize:50,offset:50});
  });
  it("rejects malformed and oversized ranges", () => {
    for (const query of ["page=abc", "page=Infinity", "page=1.2", "page=0", "page=-1", "page=100001", "page=9007199254740992", "page_size=51", "page_size=NaN", "page_size=0", "page=2oops"])
      expect(adminPagination(new URLSearchParams(query))).toBeNull();
  });
});
