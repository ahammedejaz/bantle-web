import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminToastProvider } from "@/components/admin/AdminToastProvider";
import { DealDetailClient } from "./DealDetailClient";

describe("retained deal after participant deletion", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("keeps retained messages and terms readable without a listing or host", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        deal: { id: "deal-retained", listing_id: null, host_id: null,
          buyer_id: "buyer-survivor", conversation_id: "conversation-retained",
          status: "completed", agreed_price: 250, duration_months: null,
          terms_snapshot: { terms_type: "one_time", price_amount: 250, price_period: "one_time" } },
        listing: null, host: null,
        buyer: { id: "buyer-survivor", display_name: "Surviving buyer", email: null },
        conversation: { id: "conversation-retained", listing_id: null, host_id: null,
          buyer_id: "buyer-survivor", last_message_at: null },
        recent_messages: [{ id: "message-retained", sender_id: null, kind: "text", text: "Retained evidence" }],
        ratings: [], audit_entries: [], disclaimer_acceptances: [],
      }),
    }));
    render(<AdminToastProvider><DealDetailClient dealId="deal-retained" /></AdminToastProvider>);
    expect(await screen.findByText("Retained evidence")).toBeInTheDocument();
    expect(screen.getByText("Listing unavailable")).toBeInTheDocument();
    expect(screen.getByText("Profile missing.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Surviving buyer" })).toHaveAttribute("href", "/admin/users/buyer-survivor");
    expect(screen.getByText(/Rs\. 250 one-time/)).toBeInTheDocument();
    expect(document.querySelector('a[href*="/null"]')).toBeNull();
  });
});
