import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ list: vi.fn(), enroll: vi.fn(), remove: vi.fn(), verify: vi.fn() }));
vi.mock("@/lib/admin-supabase-browser", () => ({ createAdminBrowserSupabase: () => ({ auth: { mfa: { listFactors: mocks.list, enroll: mocks.enroll, unenroll: mocks.remove, challengeAndVerify: mocks.verify } } }) }));
import { MfaClient } from "./MfaClient";
describe("admin MFA", () => {
  beforeEach(() => vi.clearAllMocks());
  it("shows challenge for existing factors without enrolling or removing them", async () => {
    mocks.list.mockResolvedValue({ data: { totp: [{id:"verified",friendly_name:"Phone"}], all: [] }, error: null });
    render(<MfaClient />);
    expect(await screen.findByLabelText("Six-digit code")).toBeInTheDocument();
    expect(mocks.enroll).not.toHaveBeenCalled(); expect(mocks.remove).not.toHaveBeenCalled();
    mocks.verify.mockResolvedValue({error:{message:"invalid"}});
    fireEvent.change(screen.getByLabelText("Six-digit code"), {target:{value:"123456"}});
    fireEvent.click(screen.getByText("Verify and continue"));
    expect(await screen.findByRole("alert")).toHaveTextContent("couldn't be verified");
    expect(mocks.verify).toHaveBeenCalledWith({factorId:"verified",code:"123456"});
  });
  it("enrolls on an explicit click and only removes abandoned unverified factors", async () => {
    mocks.list.mockResolvedValue({ data: {totp:[],all:[{id:"abandoned",status:"unverified",factor_type:"totp"}]},error:null });
    mocks.remove.mockResolvedValue({error:null});
    mocks.enroll.mockResolvedValue({data:{id:"new",totp:{qr_code:"data:image/svg+xml,test",secret:"test-only-key"}},error:null});
    render(<MfaClient />);
    fireEvent.click(await screen.findByText("Set up authenticator"));
    await waitFor(() => expect(mocks.enroll).toHaveBeenCalledOnce());
    expect(mocks.remove).toHaveBeenCalledWith({factorId:"abandoned"});
    expect(await screen.findByAltText("Authenticator setup QR code")).toBeInTheDocument();
  });
});
