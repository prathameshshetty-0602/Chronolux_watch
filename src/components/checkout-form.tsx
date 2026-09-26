"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { useToast } from "@/components/toast-provider";
import { money } from "@/lib/money";
import { storeConfig, taxLabel } from "@/lib/store-config";

type Address = {
  id: string; label: string; fullName: string; phone: string; line1: string; line2: string | null;
  city: string; state: string; country: string; postalCode: string; isDefault: boolean;
};

const emptyAddress = {
  fullName: "", phone: "", line1: "", line2: "", city: "", state: "", country: "India", postalCode: "",
};

export function CheckoutForm({ mockMode, paymentAvailable }: { mockMode: boolean; paymentAvailable: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const { items, subtotal, ready } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [address, setAddress] = useState(emptyAddress);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (key: keyof typeof emptyAddress, value: string) => setAddress((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    fetch("/api/addresses", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        const saved = data.addresses ?? [];
        setAddresses(saved);
        const preferred = saved.find((item: Address) => item.isDefault) ?? saved[0];
        if (preferred) setSelectedAddress(preferred.id);
        else setUseNewAddress(true);
      })
      .catch(() => setUseNewAddress(true));
  }, []);

  const tax = Math.round(subtotal * storeConfig.taxRate * 100) / 100;
  const savings = items.reduce((total, item) => total + Math.max(0, (item.product.compareAtPrice ?? item.product.price) - item.product.price) * item.quantity, 0);
  const shipping = subtotal >= storeConfig.freeShippingThreshold || subtotal === 0 ? 0 : storeConfig.standardShippingFee;
  const total = useMemo(() => subtotal + tax + shipping, [subtotal, tax, shipping]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = !useNewAddress && selectedAddress ? { addressId: selectedAddress } : { address };
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Checkout could not be started.");
      if (data.paymentMode === "test") {
        toast("Development test order created. No payment was taken.", "info");
        router.push("/checkout/complete?order=" + encodeURIComponent(data.orderId));
        router.refresh();
      } else if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
      } else {
        throw new Error("Payment setup didn't return a checkout page.");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Checkout could not be started.");
    } finally { setBusy(false); }
  }

  if (!ready) return <div className="checkout-layout"><div className="skeleton loading-block" /></div>;
  if (!items.length) return <div className="section"><div className="empty-state"><h3>Your bag is empty.</h3><p>Add a watch before starting checkout.</p><button className="button button-gold" onClick={() => router.push("/watches")}>Browse watches <ArrowRight size={14} /></button></div></div>;

  return (
    <form className="checkout-layout" onSubmit={submit}>
      <div>
        <section className="checkout-panel">
          <h2>Delivery details</h2>
          {addresses.length > 0 && (
            <>
              {addresses.map((item) => (
                <label className={"address-choice" + (!useNewAddress && selectedAddress === item.id ? " active" : "")} key={item.id}>
                  <input type="radio" name="address" value={item.id} checked={!useNewAddress && selectedAddress === item.id} onChange={() => { setUseNewAddress(false); setSelectedAddress(item.id); }} />
                  <span><b>{item.label}</b> · {item.fullName}<br />{item.line1}{item.line2 ? ", " + item.line2 : ""}, {item.city}, {item.state} {item.postalCode}<br />{item.phone}</span>
                </label>
              ))}
              <label className={"address-choice" + (useNewAddress ? " active" : "")}>
                <input type="radio" name="address" checked={useNewAddress} onChange={() => setUseNewAddress(true)} />
                <span>Use a new delivery address</span>
              </label>
            </>
          )}
          {useNewAddress && (
            <div className="form-stack" style={{ marginTop: 16 }}>
              <div className="form-grid">
                <Field label="Full name" value={address.fullName} onChange={(value) => set("fullName", value)} autoComplete="name" />
                <Field label="Phone" value={address.phone} onChange={(value) => set("phone", value)} autoComplete="tel" />
              </div>
              <Field label="Address" value={address.line1} onChange={(value) => set("line1", value)} autoComplete="address-line1" />
              <Field label="Apartment, suite, etc. (optional)" value={address.line2} onChange={(value) => set("line2", value)} autoComplete="address-line2" required={false} />
              <div className="form-grid">
                <Field label="City" value={address.city} onChange={(value) => set("city", value)} autoComplete="address-level2" />
                <Field label="State" value={address.state} onChange={(value) => set("state", value)} autoComplete="address-level1" />
              </div>
              <div className="form-grid">
                <Field label="Country" value={address.country} onChange={(value) => set("country", value)} autoComplete="country-name" />
                <Field label="PIN / postal code" value={address.postalCode} onChange={(value) => set("postalCode", value)} autoComplete="postal-code" />
              </div>
            </div>
          )}
        </section>
        <section className="checkout-panel" style={{ marginTop: 16 }}>
          <h2>Payment</h2>
          {mockMode ? (
            <div className="error-panel" style={{ borderColor: "rgba(201,169,108,.25)", background: "#191710" }}>
              <b style={{ color: "var(--gold-light)", fontSize: 11 }}>DEVELOPMENT TEST MODE</b>
              <p>This creates a clearly marked test order for workflow checks. No card is charged and no money is collected.</p>
            </div>
          ) : paymentAvailable ? (
            <p className="detail-description">You will continue to Stripe&apos;s secure checkout to enter payment details. Your order is marked pending until Stripe confirms payment.</p>
          ) : (
            <div className="error-panel"><h2>Payments aren&apos;t configured.</h2><p>The store owner must connect Stripe, or enable the development-only test mode locally, before checkout can accept an order.</p></div>
          )}
        </section>
      </div>
      <aside className="cart-summary">
        <h2>Your order</h2>
        {items.map((item) => <div className="summary-line" key={item.productId}><span>{item.product.name} × {item.quantity}{item.variant ? <small style={{ display: "block", color: "#838884" }}>{item.variant}</small> : null}</span><span>{money(item.product.price * item.quantity)}</span></div>)}
        <div className="summary-line"><span>Subtotal</span><span>{money(subtotal)}</span></div>
        {savings > 0 && <div className="summary-line"><span>Price savings</span><span>−{money(savings)}</span></div>}
        <div className="summary-line"><span>Estimated tax ({taxLabel()})</span><span>{money(tax)}</span></div>
        <div className="summary-line"><span>Shipping</span><span>{shipping ? money(shipping) : "Complimentary"}</span></div>
        <div className="summary-line summary-total"><strong>Total</strong><strong>{money(total)}</strong></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-gold button-full" disabled={busy || !paymentAvailable}>{busy ? "Preparing checkout…" : mockMode ? "Place development test order" : "Continue to secure payment"} <LockKeyhole size={14} /></button>
        <p className="summary-note">All pricing is calculated on the server from current catalog and stock data. Orders reserve inventory until payment confirmation or session expiry.</p>
      </aside>
    </form>
  );
}

function Field({ label, value, onChange, autoComplete, required = true }: { label: string; value: string; onChange: (value: string) => void; autoComplete?: string; required?: boolean }) {
  const id = "address-" + label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return <div><label className="field-label" htmlFor={id}>{label}</label><input className="field" id={id} value={value} autoComplete={autoComplete} required={required} onChange={(event) => onChange(event.target.value)} /></div>;
}
