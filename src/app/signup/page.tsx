import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignupForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Create account", description: "Create your ChronoLux account." };

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) redirect("/account");
  return (
    <div className="auth-layout">
      <div className="auth-art">
        <Image src="/watches/watch-03.svg" width={720} height={800} alt="ChronoLux timepiece" priority />
        <div className="auth-art-copy"><span className="eyebrow">A more personal collection</span><h2>Your time, your way.</h2><p>Keep your favourites close and follow every order from our atelier to your door.</p></div>
      </div>
      <div className="auth-panel">
        <div className="auth-form-wrap">
          <span className="eyebrow">Join ChronoLux</span><h1>Create account.</h1><p className="auth-intro">A few details are all we need to get started.</p>
          <SignupForm />
          <div className="auth-bottom">Already have an account? <Link href="/login">Sign in</Link></div>
        </div>
      </div>
    </div>
  );
}
