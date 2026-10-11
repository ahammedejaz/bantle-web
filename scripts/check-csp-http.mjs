import assert from "node:assert/strict";

// Run against a freshly built local production server or the deployed site.
const base = process.argv[2];
assert(base, "Usage: node scripts/check-csp-http.mjs http://127.0.0.1:3418");
const checks = [
  ["/", 200], ["/about", 200], ["/admin/login", 200],
  ["/reset-password", 200], ["/verify", 200],
  ["/admin/users/synthetic.png", 307], ["/unknown.svg", 404],
  ["/admin", 307], ["/admin/mfa", 307], ["/admin/api/listings", 401],
];
const seen = new Set();
for (const [path, expected] of checks) {
  const response = await fetch(new URL(path, base), {
    redirect: "manual", headers: { "x-nonce": "attacker-nonce" },
  });
  assert.equal(response.status, expected, path);
  const csp = response.headers.get("content-security-policy");
  assert(csp && !csp.includes("attacker-nonce"), `CSP missing or spoofed: ${path}`);
  const nonce = csp.match(/'nonce-([^']+)'/)?.[1];
  assert(nonce && !seen.has(nonce), `Nonce missing or reused: ${path}`);
  seen.add(nonce);
  assert.match(response.headers.get("cache-control") ?? "", /private.*no-store/, path);
  const body = await response.text();
  if (response.headers.get("content-type")?.includes("text/html")) {
    for (const tag of body.matchAll(/<script\b[^>]*>/g)) {
      assert(tag[0].includes(`nonce="${nonce}"`), `Script nonce mismatch: ${path}`);
    }
  }
  if (path === "/admin/api/listings") assert.match(response.headers.get("content-type") ?? "", /application\/json/);
  console.log(`${expected} ${path}: fresh CSP, no-store, no spoofed nonce`);
}
