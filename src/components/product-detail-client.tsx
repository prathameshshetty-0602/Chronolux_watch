"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, BadgeCheck, Box, Heart, Minus, Plus, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { useWishlist } from "@/components/wishlist-provider";
import { useToast } from "@/components/toast-provider";
import { StarRating } from "@/components/store-ui";
import type { StoreProduct } from "@/types/store";
import { money } from "@/lib/money";
import { discountPercent } from "@/lib/catalog";

export function ProductDetailClient({ product }: { product: StoreProduct }) {
  const [imageIndex, setImageIndex] = useState(0);
  const [color, setColor] = useState(product.colorOptions[0] ?? "");
  const [strap, setStrap] = useState(product.strapOptions[0] ?? product.strapMaterial);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { toggle, ids } = useWishlist();
  const toast = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const images = product.images.length ? product.images : [{ url: "/watches/watch-01.svg", alt: product.name }];
  const selectedVariant = [color, strap].filter(Boolean).join(" · ");
  const saved = ids.includes(product.id);

  async function add(buyNow = false) {
    setBusy(true);
    try {
      await addItem(product, quantity, selectedVariant);
      if (buyNow) router.push("/cart");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not add this watch.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="product-detail">
      <div>
        <div className="gallery-main">
          <Image src={images[imageIndex]?.url ?? images[0].url} alt={images[imageIndex]?.alt ?? product.name} fill sizes="(max-width: 640px) 100vw, 48vw" priority />
        </div>
        <div className="gallery-thumbs">
          {images.map((image, index) => (
            <button className={"gallery-thumb" + (index === imageIndex ? " active" : "")} key={image.url + index} onClick={() => setImageIndex(index)} aria-label={"View image " + (index + 1)}>
              <Image src={image.url} alt="" fill sizes="75px" />
            </button>
          ))}
        </div>
      </div>
      <div className="detail-content">
        <div className="eyebrow">{product.brand.name} <span style={{ color: "#696e6c" }}>· {product.model}</span></div>
        <h1>{product.name}</h1>
        <div className="detail-rating"><StarRating rating={product.rating} count={product.reviewCount} /><Link href={"/reviews/" + product.slug} className="inline-link">{product.reviewCount ? "Read reviews" : "Be the first to review"}</Link></div>
        <div className="detail-price"><strong>{money(product.price)}</strong>{product.compareAtPrice && <><span className="price-before">{money(product.compareAtPrice)}</span><span className="discount">{discountPercent(product.price, product.compareAtPrice)}% off</span></>}</div>
        <p className={product.stock < 6 ? "stock-low" : "stock-good"}>{product.stock > 0 ? (product.stock < 6 ? "Only " + product.stock + " remaining" : "In stock · Ships in 1–2 business days") : "Currently unavailable"}</p>
        <p className="detail-description">{product.description}</p>
        {!!product.colorOptions.length && (
          <div className="detail-option">
            <span className="field-label">Dial / case finish · {color}</span>
            <div className="swatch-row">{product.colorOptions.map((item) => <button className={"swatch-button" + (item === color ? " active" : "")} key={item} onClick={() => setColor(item)}>{item}</button>)}</div>
          </div>
        )}
        {!!product.strapOptions.length && product.strapOptions.length > 1 && (
          <div className="detail-option">
            <span className="field-label">Strap · {strap}</span>
            <div className="swatch-row">{product.strapOptions.map((item) => <button className={"swatch-button" + (item === strap ? " active" : "")} key={item} onClick={() => setStrap(item)}>{item}</button>)}</div>
          </div>
        )}
        <div className="detail-option">
          <span className="field-label">Quantity</span>
          <div className="quantity-stepper">
            <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity"><Minus size={14} /></button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity((value) => Math.min(20, product.stock, value + 1))} aria-label="Increase quantity" disabled={quantity >= product.stock}><Plus size={14} /></button>
          </div>
        </div>
        <div className="detail-actions">
          <button className="button button-gold" disabled={busy || product.stock < 1} onClick={() => void add(false)}>{busy ? "Adding…" : "Add to bag"} <ArrowRight size={14} /></button>
          <button className="button button-outline" disabled={busy || product.stock < 1} onClick={() => void add(true)}>Buy now</button>
        </div>
        <div style={{ marginTop: 10 }}>
          <button className="button button-outline button-small" onClick={async () => { try { await toggle(product); } catch (error) { toast(error instanceof Error ? error.message : "Wishlist update failed.", "error"); } }}>
            <Heart size={14} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved to wishlist" : "Add to wishlist"}
          </button>
        </div>
        <div className="detail-points">
          <div className="detail-point"><Truck size={15} /><span>Insured delivery<br />Complimentary over ₹10,000</span></div>
          <div className="detail-point"><ShieldCheck size={15} /><span>{product.warranty}<br />ChronoLux warranty</span></div>
          <div className="detail-point"><RotateCcw size={15} /><span>Easy returns<br />Within 14 days</span></div>
        </div>
        <div className="detail-points" style={{ borderTop: 0, marginTop: 0 }}>
          <div className="detail-point"><BadgeCheck size={15} /><span>Authenticity<br />Verified timepieces</span></div>
          <div className="detail-point"><Box size={15} /><span>Gift-ready<br />Packaging included</span></div>
          <div className="detail-point"><ShieldCheck size={15} /><span>Secure payment<br />Protected checkout</span></div>
        </div>
      </div>
    </section>
  );
}
