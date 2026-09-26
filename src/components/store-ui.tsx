"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Plus, ShoppingBag, Star, X } from "lucide-react";
import { FormEvent, useState as useStateHook } from "react";
import { useCart } from "@/components/cart-provider";
import { useWishlist } from "@/components/wishlist-provider";
import { money } from "@/lib/money";
import type { StoreProduct } from "@/types/store";
import { useToast } from "@/components/toast-provider";
import { discountPercent } from "@/lib/catalog";

export function NewsletterSignup() {
  const toast = useToast();
  const [email, setEmail] = useStateHook("");
  const [busy, setBusy] = useStateHook(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not subscribe.");
      toast(data.message);
      setEmail("");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not subscribe.", "error");
    } finally { setBusy(false); }
  }
  return <form className="newsletter-form" onSubmit={submit}><input aria-label="Email address" type="email" required placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} /><button aria-label="Subscribe" disabled={busy}><ArrowRight size={17} /></button></form>;
}

export function StarRating({ rating, count }: { rating: number; count?: number }) {
  const label = count ? rating.toFixed(1) + " from " + count + " reviews" : "No reviews yet";
  return (
    <span className="stars" aria-label={label}>
      {rating ? <><Star size={12} fill="currentColor" strokeWidth={0} /><small>{rating.toFixed(1)}{count ? " (" + count + ")" : ""}</small></> : <small style={{ color: "#858985" }}>New arrival</small>}
    </span>
  );
}

export function WishlistButton({ product }: { product: StoreProduct }) {
  const { ids, toggle } = useWishlist();
  const toast = useToast();
  const saved = ids.includes(product.id);
  return (
    <button
      className={"icon-button product-heart" + (saved ? " saved" : "")}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={saved}
      onClick={async (event) => {
        event.preventDefault();
        event.stopPropagation();
        try { await toggle(product); }
        catch (error) { toast(error instanceof Error ? error.message : "Wishlist update failed.", "error"); }
      }}
    >
      <Heart size={17} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}

export function AddToCartButton({ product, quantity = 1, variant, className = "" }: { product: StoreProduct; quantity?: number; variant?: string; className?: string }) {
  const { addItem } = useCart();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  return (
    <button
      className={"button button-gold " + className}
      disabled={busy || product.stock < 1}
      onClick={async (event) => {
        event.preventDefault();
        setBusy(true);
        try { await addItem(product, quantity, variant); }
        catch (error) { toast(error instanceof Error ? error.message : "Could not add this watch.", "error"); }
        finally { setBusy(false); }
      }}
    >
      <ShoppingBag size={14} /> {product.stock < 1 ? "Sold out" : busy ? "Adding…" : "Add to bag"}
    </button>
  );
}

export function ProductCard({ product }: { product: StoreProduct }) {
  const [quickOpen, setQuickOpen] = useState(false);
  const percent = discountPercent(product.price, product.compareAtPrice);
  const image = product.images[0] ?? { url: "/watches/watch-01.svg", alt: product.name };
  return (
    <>
      <article className="product-card">
        <Link className="product-image-wrap" href={"/product/" + product.slug}>
          <Image className="product-image" src={image.url} alt={image.alt || product.name} fill sizes="(max-width: 640px) 46vw, (max-width: 1000px) 30vw, 24vw" />
          {(product.isNewArrival || percent > 0) && <span className="product-label">{product.isNewArrival ? "New arrival" : String(percent) + "% less"}</span>}
        </Link>
        <WishlistButton product={product} />
        <div className="product-quick">
          <button className="button button-outline button-small button-full" onClick={() => setQuickOpen(true)}><Plus size={13} /> Quick view</button>
        </div>
        <div className="product-info">
          <div className="product-brand">{product.brand.name}</div>
          <Link className="product-name" href={"/product/" + product.slug}>{product.name}</Link>
          <div className="product-subline"><span>{product.category.name}</span><StarRating rating={product.rating} count={product.reviewCount} /></div>
          <div className="product-prices">
            <span className="price-now">{money(product.price)}</span>
            {product.compareAtPrice && <><span className="price-before">{money(product.compareAtPrice)}</span><span className="discount">Save {percent}%</span></>}
          </div>
        </div>
      </article>
      {quickOpen && (
        <div className="quick-view-backdrop" role="presentation" onClick={() => setQuickOpen(false)}>
          <div className="quick-view" role="dialog" aria-modal="true" aria-label={"Quick view: " + product.name} onClick={(event) => event.stopPropagation()}>
            <button className="icon-button quick-view-close" onClick={() => setQuickOpen(false)} aria-label="Close quick view"><X size={18} /></button>
            <Image src={image.url} alt={image.alt || product.name} width={420} height={470} />
            <div className="quick-view-content">
              <span className="eyebrow">{product.brand.name}</span>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 400, margin: "8px 0" }}>{product.name}</h2>
              <StarRating rating={product.rating} count={product.reviewCount} />
              <div className="product-prices" style={{ margin: "17px 0" }}><span className="price-now">{money(product.price)}</span>{product.compareAtPrice && <span className="price-before">{money(product.compareAtPrice)}</span>}</div>
              <p className="detail-description">{product.description}</p>
              <p className={product.stock < 6 ? "stock-low" : "stock-good"}>{product.stock > 0 ? product.stock + " in stock" : "Currently unavailable"}</p>
              <div style={{ display: "grid", gap: 9, marginTop: 20 }}>
                <AddToCartButton product={product} className="button-full" />
                <Link className="button button-outline button-full" href={"/product/" + product.slug} onClick={() => setQuickOpen(false)}>Full details <ArrowRight size={14} /></Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function ProductGrid({ products, empty = "No watches found." }: { products: StoreProduct[]; empty?: string }) {
  if (!products.length) {
    return <div className="empty-state"><span aria-hidden="true" style={{ color: "var(--gold)", fontFamily: "var(--font-display)", fontSize: 38 }}>◷</span><h3>{empty}</h3><p>Try another search or explore the full collection.</p><Link className="text-link" href="/watches">Browse all watches <ArrowRight size={14} /></Link></div>;
  }
  return <div className="product-grid">{products.map((product) => <ProductCard product={product} key={product.id} />)}</div>;
}

export function SectionHeading({ eyebrow, title, description, href, link = "View collection" }: { eyebrow: string; title: string; description?: string; href?: string; link?: string }) {
  return (
    <div className="section-heading">
      <div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{description && <p>{description}</p>}</div>
      {href && <Link className="text-link" href={href}>{link} <ArrowRight size={14} /></Link>}
    </div>
  );
}

export function CollectionCard({ href, title, description, image }: { href: string; title: string; description: string; image: string }) {
  return (
    <article className="collection-banner">
      <div className="collection-banner-copy">
        <span className="eyebrow">The ChronoLux edit</span>
        <h2>{title}</h2>
        <p>{description}</p>
        <Link className="text-link" href={href}>Explore the edit <ArrowRight size={14} /></Link>
      </div>
      <div className="collection-art"><Image src={image} alt="" width={250} height={280} /></div>
    </article>
  );
}
