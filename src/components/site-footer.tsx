"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowRight, Clock3 } from "lucide-react";
import { useToast } from "@/components/toast-provider";

export function SiteFooter() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const socials = [
    { label: "Instagram", href: process.env.NEXT_PUBLIC_INSTAGRAM_URL },
    { label: "Facebook", href: process.env.NEXT_PUBLIC_FACEBOOK_URL },
    { label: "YouTube", href: process.env.NEXT_PUBLIC_YOUTUBE_URL },
  ].filter((social): social is { label: string; href: string } => Boolean(social.href));

  async function subscribe(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not subscribe.");
      toast(data.message);
      setEmail("");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not subscribe.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <footer className="footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <Link className="brand" href="/">
            <Clock3 className="brand-mark" strokeWidth={1.1} />
            <span><span className="brand-word">CHRONOLUX</span><span className="brand-sub">Time, engineered for you</span></span>
          </Link>
          <p>Considered timepieces for every way you move. Designed with intention, chosen to last.</p>
        </div>
        <div>
          <h3>Discover</h3>
          <div className="footer-links">
            <Link href="/watches">All watches</Link>
            <Link href="/watches?category=smart-watches">Smart watches</Link>
            <Link href="/watches?category=luxury-watches">Luxury collection</Link>
            <Link href="/watches?category=sports-watches">Sports collection</Link>
            <Link href="/features">Watch features</Link>
          </div>
        </div>
        <div>
          <h3>ChronoLux</h3>
          <div className="footer-links">
            <Link href="/specifications">Watch guide</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/account">My account</Link>
            <Link href="/orders">Order tracking</Link>
            <Link href="/admin">Store administration</Link>
            {socials.map((social) => <a key={social.label} href={social.href} target="_blank" rel="noreferrer">{social.label}</a>)}
          </div>
        </div>
        <div>
          <h3>The ChronoLux dispatch</h3>
          <p style={{ color: "var(--muted)", fontSize: 11, margin: 0 }}>New collections, watch notes and occasional invitations.</p>
          <form className="newsletter-form" onSubmit={subscribe}>
            <input aria-label="Email for newsletter" type="email" required placeholder="Your email address" value={email} onChange={(event) => setEmail(event.target.value)} />
            <button disabled={busy} aria-label="Subscribe"><ArrowRight size={17} /></button>
          </form>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} ChronoLux. Made for the moments that matter.</span>
        <span>Secure checkout · Insured delivery · 2-year warranty</span>
      </div>
    </footer>
  );
}
