import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IdentityVerificationsClient } from "./IdentityVerificationsClient";

vi.mock("@/components/admin/AdminToastProvider", () => ({
  useAdminToast: () => ({ show: vi.fn() }),
}));

describe("identity verification queue feature state", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          verifications: [],
          total: 0,
          page_size: 20,
          feature_config: {
            identity_verification_enabled: true,
            identity_admin_review_enabled: false,
          },
        }),
      }),
    );
  });

  it("renders the queue read-only when admin review is disabled", async () => {
    render(<IdentityVerificationsClient />);
    expect(
      await screen.findByText(/queue remains read-only/i),
    ).toBeInTheDocument();
  });
});
