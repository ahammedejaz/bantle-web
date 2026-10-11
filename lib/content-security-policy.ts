export function contentSecurityPolicy(nonce: string, development = false): string {
  return [
    "default-src 'self'", "base-uri 'self'", "frame-ancestors 'none'", "object-src 'none'",
    "img-src 'self' data: blob: https:", "font-src 'self' data:",
    "style-src 'self' 'unsafe-inline'", // React style props and existing UI animations.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ""}`,
    "connect-src 'self' https://auth.bantle.in wss://auth.bantle.in https://*.supabase.co https://*.supabase.in wss://*.supabase.co wss://*.supabase.in" + (development ? " ws://localhost:*" : ""),
    "form-action 'self'",
  ].join("; ");
}
