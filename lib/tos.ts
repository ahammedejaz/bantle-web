// Terms of Service version metadata.
//
// This constant is the source of truth for the current Terms version.
// When Terms are updated:
// 1. Bump CURRENT_VERSION
// 2. Update EFFECTIVE_DATE
// 3. Update the Terms page content
// 4. Update the same constant in the mobile repo so the blocking
//    re-acceptance modal compares against the right value.

export const CURRENT_VERSION = "3.0";
export const EFFECTIVE_DATE = "2026-06-28";
export const EFFECTIVE_DATE_DISPLAY = "28 June 2026";

export const CHANGES_FROM_PREVIOUS = [
  "Repositioned Bantle as helping people split or buy subscription access where the provider's terms allow it, instead of household-only coordination",
  "Clarified that some family or household plans may require members to live in the same household or location, and that users must check and follow each provider's terms before listing, requesting, or buying access",
  "Updated user attestations from household membership to provider-terms compliance",
  "Reaffirmed that payments happen outside Bantle and that Bantle does not process, verify, insure, reverse, or guarantee payments, access, refunds, or outcomes",
];
