// Terms of Service version metadata.
//
// This constant is the source of truth for the current Terms version.
// When Terms are updated:
// 1. Bump CURRENT_VERSION
// 2. Update EFFECTIVE_DATE
// 3. Update the Terms page content
// 4. Update the same constant in the mobile repo so the blocking
//    re-acceptance modal compares against the right value.

export const CURRENT_VERSION = "2.0";
export const EFFECTIVE_DATE = "2026-05-14";
export const EFFECTIVE_DATE_DISPLAY = "14 May 2026";

export const CHANGES_FROM_PREVIOUS = [
  "Reframed Bantle as a household coordination tool, not a marketplace for finding strangers",
  "Added user attestations that every member of a coordination plan belongs to the same household",
  "Strengthened user responsibility for complying with each provider's terms of service",
  "Removed phone verification references — Bantle uses email verification",
  "Removed Netflix from the catalogue of supported family plans",
];
