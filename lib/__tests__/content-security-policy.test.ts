import { describe, it, expect } from "vitest";
import { contentSecurityPolicy } from "../content-security-policy";
describe("nonce CSP", () => {
  it("permits only nonce-authorized production scripts and no eval", () => {
    const script = contentSecurityPolicy("testnonce").split("; ").find((s) => s.startsWith("script-src"));
    expect(script).toContain("'nonce-testnonce' 'strict-dynamic'");
    expect(script).not.toContain("unsafe-inline");
    expect(script).not.toContain("unsafe-eval");
    expect(contentSecurityPolicy("testnonce", true)).toContain("unsafe-eval");
  });
});
