import type { Metadata } from "next";
import { PasswordResetForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return (
    <section className="container section" style={{ maxWidth: 590 }}>
      <div className="data-card">
        <span className="eyebrow">Account recovery</span><h1 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 38 }}>Choose a new password.</h1>
        {token ? <PasswordResetForm token={token} /> : <p className="form-error">This reset link is missing or invalid. Request a new link to continue.</p>}
      </div>
    </section>
  );
}
