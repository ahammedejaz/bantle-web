import { Suspense } from "react";
import { LoginClient } from "./LoginClient";

export const metadata = {
  title: "Sign in — Bantle admin",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}
