"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { useToast } from "@/components/toast-provider";
import { money } from "@/lib/money";
import { storeConfig, taxLabel } from "@/lib/store-config";

export default function CartPage() {
  const { items, subtotal, ready, setQuantity, removeItem } = useCart();
  const toast = useToast();
  const [busy, setBusy] = useState("");
  const shipping = subtotal >= storeConfig.freeShippingThreshold || subtotal === 0 ? 0 : storeConfig.standardShippingFee;
  const tax = Math.round(subtotal * storeConfig.taxRate * 100) / 100;
  const savings = items.reduce((total, item) => total + Math.max(0, (item.product.compareAtPrice ?? item.product.price) - item.product.price) * item.quantity, 0);

  async function act(productId: string, callback: () => Promise<void>) {
    setBusy(productId);
    try { await callback(); }
    catch (error) { toast(error instanceof Error ? error.message : "The cart couldn't be updated.", "error"); }
    finally { setBusy(""); }
  }

  if (!ready) return <section className="container section"><div className="skeleton loading-block" /></section>;
  return (
    <>
      <section className="page-hero"><div className="container"><span className="eyebrow">Your collection, in progress</span><h1>Shopping bag.</h1><p>Review your pieces before moving on to secure checkout.</p></div></section>
      <div className="container cart-layout">
        {items.length ? (
          <div className="cart-items">
            {items.map((item) => (
              <article className="cart-row" key={item.productId}>
                <Link href={"/product/" + item.product.slug}><Image src={item.product.images[0]?.url ?? "/watches/watch-01.svg"} alt={item.product.name} width={120} height={140} /></Link>
                <div>
                  <div className="product-brand">{item.product.brand.name}</div><h3><Link href={"/product/" + item.product.slug}>{item.product.name}</Link></h3>
                  {item.variant && <p>Finish: {item.variant}</p>}
                  <div className="quantity-stepper">
                    <button aria-label="Decrease quantity" disabled={busy === item.productId || item.quantity <= 1} onClick={() => void act(item.productId, () => setQuantity(item.productId, item.quantity - 1))}><Minus size={13} /></button>
                    <span>{item.quantity}</span>
                    <button aria-label="Increase quantity" disabled={busy === item.productId || item.quantity >= item.product.stock} onClick={() => void act(item.productId, () => setQuantity(item.productId, item.quantity + 1))}><Plus size={13} /></button>
                  </div>
                </div>
                <div className="cart-price">{money(item.product.price * item.quantity)}{item.product.compareAtPrice && <div className="price-before">{money(item.product.compareAtPrice * item.quantity)}</div>}</div>
                <button className="icon-button" onClick={() => void act(item.productId, () => removeItem(item.productId))} aria-label={"Remove " + item.product.name} disabled={busy === item.productId}><Trash2 size={16} /></button>
              </article>
            ))}
            <Link className="text-link" href="/watches" style={{ marginTop: 18 }}>Continue shopping <ArrowRight size={14} /></Link>
          </div>
        ) : (
          <div className="empty-state"><ShoppingBag size={31} color="var(--gold)" /><h3>Your bag is waiting.</h3><p>Explore the collection and add a watch that feels like you.</p><Link className="button button-gold" href="/watches">Browse watches <ArrowRight size={14} /></Link></div>
        )}
        <aside className="cart-summary">
          <h2>Order summary</h2>
          <div className="summary-line"><span>Subtotal</span><span>{money(subtotal)}</span></div>
          {savings > 0 && <div className="summary-line"><span>Price savings</span><span>−{money(savings)}</span></div>}
          <div className="summary-line"><span>Estimated tax ({taxLabel()})</span><span>{money(tax)}</span></div>
          <div className="summary-line"><span>Shipping</span><span>{shipping ? money(shipping) : "Complimentary"}</span></div>
          <div className="summary-line summary-total"><strong>Estimated total</strong><strong>{money(subtotal + tax + shipping)}</strong></div>
          <Link className={"button button-gold button-full" + (!items.length ? " disabled-link" : "")} aria-disabled={!items.length} href={items.length ? "/checkout" : "/watches"}>Continue to checkout <ArrowRight size={14} /></Link>
          <p className="summary-note">Tax and shipping estimates are configured for this store. Confirm they match your business, destinations and applicable rules before taking live orders.</p>
          <p className="summary-note">Secure payment · Insured delivery · 14-day return window</p>
        </aside>
      </div>
    </>
  );
}
