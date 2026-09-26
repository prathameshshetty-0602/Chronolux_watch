"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight, Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useWishlist } from "@/components/wishlist-provider";
import { useCart } from "@/components/cart-provider";
import { useToast } from "@/components/toast-provider";
import { money } from "@/lib/money";
import type { StoreProduct } from "@/types/store";

export default function WishlistPage() {
  const { status } = useSession();
  const { remove } = useWishlist();
  const { addItem } = useCart();
  const toast = useToast();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loaded, setLoaded] = useState(false);
  const loading = status === "loading" || (status === "authenticated" && !loaded);

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated") return;
    fetch("/api/wishlist", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setProducts((data.items ?? []).map((item: { product: StoreProduct }) => item.product)))
      .catch(() => toast("Your wishlist couldn't load.", "error"))
      .finally(() => setLoaded(true));
  }, [status, toast]);

  async function move(product: StoreProduct) {
    try {
      await addItem(product);
      await remove(product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      toast("Moved to your bag.");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not move this watch.", "error");
    }
  }

  async function deleteItem(product: StoreProduct) {
    try { await remove(product.id); setProducts((current) => current.filter((item) => item.id !== product.id)); }
    catch (error) { toast(error instanceof Error ? error.message : "Could not remove this watch.", "error"); }
  }

  return (
    <>
      <section className="page-hero"><div className="container"><span className="eyebrow">Saved for later</span><h1>Your wishlist.</h1><p>The pieces you&apos;ve been thinking about, kept close.</p></div></section>
      <section className="container section">
        {loading ? <div className="skeleton loading-block" /> : status !== "authenticated" ? (
          <div className="empty-state"><Heart size={30} color="var(--gold)" /><h3>Your wishlist is personal.</h3><p>Sign in to save watches and keep your selection between visits.</p><Link className="button button-gold" href="/login?callbackUrl=%2Fwishlist">Sign in</Link></div>
        ) : products.length ? (
          <div className="product-grid">{products.map((product) => (
            <article className="product-card" key={product.id}>
              <Link className="product-image-wrap" href={"/product/" + product.slug}><Image className="product-image" src={product.images[0]?.url ?? "/watches/watch-01.svg"} alt={product.name} fill sizes="(max-width: 640px) 46vw, 24vw" /></Link>
              <div className="product-info"><div className="product-brand">{product.brand.name}</div><Link className="product-name" href={"/product/" + product.slug}>{product.name}</Link><div className="product-prices"><span className="price-now">{money(product.price)}</span></div><div style={{ display: "flex", gap: 7, marginTop: 13 }}><button className="button button-gold button-small" onClick={() => void move(product)}><ShoppingBag size={13} /> Move to bag</button><button className="icon-button" aria-label={"Remove " + product.name} onClick={() => void deleteItem(product)}><Trash2 size={15} /></button></div></div>
            </article>
          ))}</div>
        ) : <div className="empty-state"><Heart size={30} color="var(--gold)" /><h3>Your wishlist is clear.</h3><p>Save a few favourites and compare them when you&apos;re ready.</p><Link className="button button-gold" href="/watches">Explore watches <ArrowRight size={14} /></Link></div>}
      </section>
    </>
  );
}
