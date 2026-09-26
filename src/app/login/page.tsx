import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Sign in", description: "Sign in to manage your ChronoLux account, orders and wishlist." };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string; reset?: string }> }) {
  const session = await auth();
  const query = await searchParams;
  const callbackUrl = query.callbackUrl?.startsWith("/") && !query.callbackUrl.startsWith("//") ? query.callbackUrl : "/account";
  if (session?.user) redirect(callbackUrl);
  return (
    <div className="auth-layout">
      <div className="auth-art">
        <Image src="/watches/watch-07.svg" width={720} height={800} alt="ChronoLux Atelier watch" priority />
        <div className="auth-art-copy"><span className="eyebrow">Welcome back</span><h2>Time, kept beautifully.</h2><p>Your saved watches, orders and personal collection—together in one place.</p></div>
      </div>
      <div className="auth-panel">
        <div className="auth-form-wrap">
          <span className="eyebrow">Your ChronoLux account</span>
          <h1>Sign in.</h1>
          <p className="auth-intro">Welcome back. Sign in to continue to your account.</p>
          {query.reset === "success" && <p className="form-success">Password updated. Sign in with your new password.</p>}
          <LoginForm callbackUrl={callbackUrl} />
          <div className="auth-bottom">Don&apos;t have an account? <Link href="/signup">Create one</Link></div>
        </div>
      </div>
    </div>
  );
}
