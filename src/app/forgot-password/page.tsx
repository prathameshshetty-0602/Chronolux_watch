import type { Metadata } from "next";
import Link from "next/link";
import { PasswordResetRequestForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <section className="container section" style={{ maxWidth: 590 }}>
      <div className="data-card">
        <span className="eyebrow">Account recovery</span><h1 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 38 }}>Reset your password.</h1>
        <p className="detail-description">Enter the email address on your account. If it exists, we&apos;ll send a secure link that expires in one hour.</p>
        <PasswordResetRequestForm />
        <div className="auth-bottom"><Link href="/login">Back to sign in</Link></div>
      </div>
    </section>
  );
}
