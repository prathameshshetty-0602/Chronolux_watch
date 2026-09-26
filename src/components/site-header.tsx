"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ArrowRight, Clock3, Heart, Menu, Search, ShoppingBag, UserRound, ChevronDown, X } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { money } from "@/lib/money";

type Suggestion = { name: string; slug: string; price: number; brand: { name: string }; images: { url: string; alt: string }[] };
const navLinks = [
  { href: "/watches", label: "Watches" },
  { href: "/features", label: "Features" },
  { href: "/specifications", label: "Guide" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useSession();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [focused, setFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) return;
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/search?q=" + encodeURIComponent(query.trim()));
        const data = await response.json();
        setSuggestions(data.suggestions ?? []);
      } catch {
        setSuggestions([]);
      }
    }, 180);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const onOutside = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) setFocused(false);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    setFocused(false);
    router.push("/watches?q=" + encodeURIComponent(value));
  }

  const signedIn = status === "authenticated";

  return (
    <>
      <div className="topline">Complimentary insured delivery on orders over ₹10,000</div>
      <header className="site-header">
        <div className="container nav-main">
          <button className="icon-button menu-toggle" onClick={() => setMenuOpen((value) => !value)} aria-label={menuOpen ? "Close navigation" : "Open navigation"}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link className="brand" href="/" aria-label="ChronoLux home" onClick={() => setMenuOpen(false)}>
            <Clock3 className="brand-mark" strokeWidth={1.1} />
            <span><span className="brand-word">CHRONOLUX</span><span className="brand-sub">Time, engineered for you</span></span>
          </Link>
          <nav className={"primary-nav" + (menuOpen ? " open" : "")} aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link className={pathname === link.href || (link.href === "/watches" && pathname.startsWith("/product")) ? "active" : ""} href={link.href} key={link.href} onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href="/watches?category=smart-watches" onClick={() => setMenuOpen(false)}>Smart</Link>
            <Link href="/watches?category=luxury-watches" onClick={() => setMenuOpen(false)}>Luxury</Link>
          </nav>
          <div className="nav-actions">
            <div className="search-wrap" ref={searchRef}>
              <form className="search-input-wrap" onSubmit={submitSearch} role="search">
                <button className="icon-button" type="submit" aria-label="Search watches"><Search size={16} /></button>
                <input aria-label="Search watches" placeholder="Search watches" value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setFocused(true)} />
                {query && <button className="icon-button" type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={14} /></button>}
              </form>
              {focused && query.trim().length >= 2 && (
                <div className="search-results">
                  {suggestions.length ? suggestions.map((item) => (
                    <Link className="search-result" key={item.slug} href={"/product/" + item.slug} onClick={() => { setFocused(false); setQuery(""); }}>
                      <Image src={item.images[0]?.url ?? "/watches/watch-01.svg"} alt="" width={39} height={44} />
                      <span><b>{item.name}</b><small>{item.brand.name} · {money(item.price)}</small></span>
                    </Link>
                  )) : <div className="search-result"><small>No matching watches yet.</small></div>}
                  <Link className="search-all" href={"/watches?q=" + encodeURIComponent(query)} onClick={() => setFocused(false)}>View all results <ArrowRight size={12} /></Link>
                </div>
              )}
            </div>
            <Link className="icon-button" href={signedIn ? "/wishlist" : "/login?callbackUrl=%2Fwishlist"} aria-label="Wishlist"><Heart size={18} /></Link>
            <Link className="icon-button" href="/cart" aria-label="Shopping bag"><ShoppingBag size={18} />{count > 0 && <span className="count-badge">{count > 99 ? "99+" : count}</span>}</Link>
            {signedIn ? (
              <div className="account-action">
                <Link className="icon-button" href="/account" aria-label="Your account"><UserRound size={18} /></Link>
                <button className="account-signout" onClick={() => signOut({ callbackUrl: "/" })} aria-label="Sign out"><ChevronDown size={12} /> Sign out</button>
              </div>
            ) : (
              <Link className="button button-outline button-small sign-in-button" href="/login">Sign in</Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
