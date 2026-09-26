"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Check, MapPin, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/toast-provider";

type UserInfo = { id: string; name: string; email: string; phone: string | null; role: string; createdAt: Date };
type Address = { id: string; label: string; fullName: string; phone: string; line1: string; line2: string | null; city: string; state: string; country: string; postalCode: string; isDefault: boolean };
type Review = { id: string; rating: number; title: string; body: string; status: string; product: { name: string; slug: string } };
const blank = { label: "Home", fullName: "", phone: "", line1: "", line2: "", city: "", state: "", country: "India", postalCode: "", isDefault: false };

export function AccountDashboard({ user, addresses: initialAddresses, reviews, stats }: { user: UserInfo; addresses: Address[]; reviews: Review[]; stats: { orders: number; wishlist: number; reviews: number } }) {
  const toast = useToast();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [profile, setProfileValues] = useState({ name: user.name, phone: user.phone ?? "" });
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "" });
  const [address, setAddress] = useState(blank);
  const [showAddress, setShowAddress] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    setBusy("profile");
    setError("");
    try {
      const response = await fetch("/api/account", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Profile couldn't be saved.");
      toast("Profile updated.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Profile couldn't be saved."); }
    finally { setBusy(""); }
  }

  async function savePassword(event: FormEvent) {
    event.preventDefault();
    setBusy("password");
    setError("");
    try {
      const response = await fetch("/api/account/password", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(password) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Password couldn't be updated.");
      setPassword({ currentPassword: "", newPassword: "" });
      toast("Password updated.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Password couldn't be updated."); }
    finally { setBusy(""); }
  }

  async function createAddress(event: FormEvent) {
    event.preventDefault();
    setBusy("address");
    setError("");
    try {
      const response = await fetch("/api/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(address) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Address couldn't be saved.");
      setAddresses((current) => address.isDefault ? [data.address, ...current.map((item) => ({ ...item, isDefault: false }))] : [data.address, ...current]);
      setAddress(blank);
      setShowAddress(false);
      toast("Address saved.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Address couldn't be saved."); }
    finally { setBusy(""); }
  }

  async function deleteAddress(id: string) {
    const response = await fetch("/api/addresses/" + id, { method: "DELETE" });
    if (!response.ok) { toast("Address couldn't be removed.", "error"); return; }
    setAddresses((current) => current.filter((item) => item.id !== id));
    toast("Address removed.", "info");
  }

  const setProfile = (key: keyof typeof profile, value: string) => setProfileValues((current) => ({ ...current, [key]: value }));

  return (
    <div className="account-main">
      <div className="stat-grid">
        <Link href="/orders" className="stat-card"><strong>{stats.orders}</strong><span>Orders</span></Link>
        <Link href="/wishlist" className="stat-card"><strong>{stats.wishlist}</strong><span>Saved watches</span></Link>
        <a href="#reviews" className="stat-card"><strong>{stats.reviews}</strong><span>Reviews</span></a>
      </div>
      <section className="data-card">
        <h2>Profile details</h2>
        <p className="field-hint">Account created {new Date(user.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long" })} · {user.role === "ADMIN" ? "Administrator account" : "ChronoLux member"}</p>
        <form className="form-stack" onSubmit={saveProfile}>
          <div className="form-grid">
            <div><label className="field-label" htmlFor="account-name">Full name</label><input className="field" id="account-name" value={profile.name} onChange={(event) => setProfile("name", event.target.value)} required minLength={2} /></div>
            <div><label className="field-label" htmlFor="account-phone">Phone</label><input className="field" id="account-phone" type="tel" value={profile.phone} onChange={(event) => setProfile("phone", event.target.value)} /></div>
          </div>
          <div><label className="field-label" htmlFor="account-email">Email</label><input className="field" id="account-email" value={user.email} disabled /><p className="field-hint">Contact support if you need to change your sign-in email.</p></div>
          {error && <p className="form-error">{error}</p>}
          <button className="button button-gold" disabled={busy === "profile"}>{busy === "profile" ? "Saving…" : "Save profile"} <Check size={14} /></button>
        </form>
      </section>
      <section className="data-card">
        <h2>Change password</h2>
        <form className="form-stack" onSubmit={savePassword}>
          <div><label className="field-label" htmlFor="current-password">Current password</label><input className="field" id="current-password" type="password" autoComplete="current-password" required value={password.currentPassword} onChange={(event) => setPassword((current) => ({ ...current, currentPassword: event.target.value }))} /></div>
          <div><label className="field-label" htmlFor="new-password">New password</label><input className="field" id="new-password" type="password" autoComplete="new-password" required minLength={10} value={password.newPassword} onChange={(event) => setPassword((current) => ({ ...current, newPassword: event.target.value }))} /><p className="field-hint">10+ characters with upper and lower case, a number and a symbol.</p></div>
          <button className="button button-outline" disabled={busy === "password"}>{busy === "password" ? "Updating…" : "Update password"}</button>
        </form>
      </section>
      <section className="data-card" id="addresses">
        <div className="section-heading"><div><span className="eyebrow">Delivery details</span><h2>Saved addresses</h2></div><button className="button button-outline button-small" onClick={() => setShowAddress((value) => !value)}><Plus size={13} /> Add address</button></div>
        {showAddress && (
          <form className="form-stack" onSubmit={createAddress} style={{ marginBottom: 20 }}>
            <div className="form-grid">{(["label", "fullName", "phone"] as const).map((key) => <div key={key}><label className="field-label" htmlFor={"address-" + key}>{key === "fullName" ? "Full name" : key === "phone" ? "Phone" : "Label"}</label><input className="field" id={"address-" + key} value={address[key]} onChange={(event) => setAddress((current) => ({ ...current, [key]: event.target.value }))} required /></div>)}</div>
            <div><label className="field-label" htmlFor="address-line1">Address</label><input className="field" id="address-line1" value={address.line1} onChange={(event) => setAddress((current) => ({ ...current, line1: event.target.value }))} required /></div>
            <div><label className="field-label" htmlFor="address-line2">Apartment, suite (optional)</label><input className="field" id="address-line2" value={address.line2} onChange={(event) => setAddress((current) => ({ ...current, line2: event.target.value }))} /></div>
            <div className="form-grid">{(["city", "state", "country", "postalCode"] as const).map((key) => <div key={key}><label className="field-label" htmlFor={"address-" + key}>{key === "postalCode" ? "PIN / postal code" : key[0].toUpperCase() + key.slice(1)}</label><input className="field" id={"address-" + key} value={address[key]} onChange={(event) => setAddress((current) => ({ ...current, [key]: event.target.value }))} required /></div>)}</div>
            <label className="checkbox-line"><input type="checkbox" checked={address.isDefault} onChange={(event) => setAddress((current) => ({ ...current, isDefault: event.target.checked }))} /> Make this my default address</label>
            <button className="button button-gold" disabled={busy === "address"}>{busy === "address" ? "Saving…" : "Save address"}</button>
          </form>
        )}
        {addresses.length ? <div className="form-grid">{addresses.map((item) => (
          <div className="address-card" key={item.id}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 9 }}><b><MapPin size={13} style={{ verticalAlign: "middle" }} /> {item.label}{item.isDefault ? " · Default" : ""}</b><button className="icon-button" aria-label="Remove address" onClick={() => void deleteAddress(item.id)}><Trash2 size={14} /></button></div>
            {item.fullName}<br />{item.line1}{item.line2 ? ", " + item.line2 : ""}<br />{item.city}, {item.state} {item.postalCode}<br />{item.country}<br />{item.phone}
          </div>
        ))}</div> : <p className="detail-description">No saved addresses yet. Checkout saves the shipping address you use.</p>}
      </section>
      <section className="data-card" id="reviews">
        <h2>Your reviews</h2>
        {reviews.length ? reviews.map((review) => <div className="review-card" key={review.id}><span className="stars">{"★".repeat(review.rating)}</span><h3>{review.title}</h3><p>{review.body}</p><small className="field-hint">For <Link className="inline-link" href={"/reviews/" + review.product.slug}>{review.product.name}</Link> · {review.status.toLowerCase()}</small></div>) : <p className="detail-description">You haven&apos;t written a review yet. Reviews become available after a confirmed purchase.</p>}
      </section>
    </div>
  );
}
