export type TermsType = "monthly" | "one_time";

export type ListingTermsLike = {
  listing_type?: string | null;
  terms_type?: string | null;
  monthly_price?: number | null;
  one_time_price?: number | null;
  duration_months?: number | null;
  access_duration_months?: number | null;
};

export type DealTermsLike = {
  agreed_price?: number | null;
  duration_months?: number | null;
  terms_snapshot?: DealTermsSnapshotLike | DealTermsSnapshotLike[] | null;
};

export type DealTermsSnapshotLike = {
  terms_type?: string | null;
  price_amount?: number | null;
  price_period?: string | null;
  duration_months?: number | null;
  access_duration_months?: number | null;
  access_type?: string | null;
  access_notes_snapshot?: string | null;
};

function firstSnapshot(
  value: DealTermsSnapshotLike | DealTermsSnapshotLike[] | null | undefined,
): DealTermsSnapshotLike | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export function listingTermsType(listing: ListingTermsLike | null): TermsType {
  return listing?.terms_type === "one_time" ||
    listing?.listing_type === "one_time"
    ? "one_time"
    : "monthly";
}

export function dealTermsType(deal: DealTermsLike | null): TermsType {
  const snapshot = firstSnapshot(deal?.terms_snapshot);
  return snapshot?.terms_type === "one_time" ||
    snapshot?.price_period === "one_time"
    ? "one_time"
    : "monthly";
}

export function listingTypeLabel(listing: ListingTermsLike | null): string {
  return listingTermsType(listing) === "one_time"
    ? "One-time access"
    : "Monthly sharing";
}

export function listingTermsSummary(listing: ListingTermsLike | null): string {
  if (!listing) return "Terms unavailable";
  if (listingTermsType(listing) === "one_time") {
    const price = listing.one_time_price ?? listing.monthly_price ?? 0;
    const months =
      listing.access_duration_months ?? listing.duration_months ?? null;
    return `Rs. ${price} one-time${
      months ? ` · ${months} mo access` : ""
    }`;
  }
  return `Rs. ${listing.monthly_price ?? 0}/mo${
    listing.duration_months ? ` · ${listing.duration_months} mo` : ""
  }`;
}

export function dealTermsSummary(deal: DealTermsLike | null): string {
  if (!deal) return "Terms unavailable";
  const snapshot = firstSnapshot(deal.terms_snapshot);
  if (dealTermsType(deal) === "one_time") {
    const price = snapshot?.price_amount ?? deal.agreed_price ?? 0;
    const months =
      snapshot?.access_duration_months ?? deal.duration_months ?? null;
    return `Rs. ${price} one-time${
      months ? ` · ${months} mo access` : ""
    }`;
  }
  const price = snapshot?.price_amount ?? deal.agreed_price ?? 0;
  const months = snapshot?.duration_months ?? deal.duration_months ?? null;
  return `Rs. ${price}/mo${months ? ` · ${months} mo` : ""}`;
}
