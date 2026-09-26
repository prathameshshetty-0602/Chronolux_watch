"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useToast } from "@/components/toast-provider";

function PasswordField({ label, name, value, onChange, autoComplete }: { label: string; name: string; value: string; onChange: (value: string) => void; autoComplete: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label className="field-label" htmlFor={name}>{label}</label>
      <div className="password-wrap">
        <input className="field" id={name} name={name} type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} required />
        <button className="password-toggle" type="button" onClick={() => setVisible((value) => !value)} aria-label={visible ? "Hide password" : "Show password"}>{visible ? <EyeOff size={16} /> : <Eye size={16} />}</button>
      </div>
    </div>
  );
}

export function LoginForm({ callbackUrl = "/" }: { callbackUrl?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const normalized = email.trim().toLowerCase();
      const result = await signIn("credentials", { email: normalized, password, redirect: false, callbackUrl });
      if (result?.error) throw new Error("Email or password is incorrect.");
      if (remember) localStorage.setItem("chronolux-remembered-email", normalized);
      else localStorage.removeItem("chronolux-remembered-email");
      toast("Welcome back to ChronoLux.");
      router.push(callbackUrl);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form-stack" onSubmit={submit}>
      <div><label className="field-label" htmlFor="email">Email address</label><input className="field" id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} onFocus={() => { if (!email) setEmail(localStorage.getItem("chronolux-remembered-email") ?? ""); }} /></div>
      <PasswordField label="Password" name="password" value={password} onChange={setPassword} autoComplete="current-password" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <label className="checkbox-line"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> Remember my email on this device</label>
        <Link className="inline-link" href="/forgot-password" style={{ fontSize: 10 }}>Forgot password?</Link>
      </div>
      {error && <div className="form-error" role="alert">{error}</div>}
      <button className="button button-gold button-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"} <LockKeyhole size={14} /></button>
      <p className="field-hint" style={{ marginTop: -5 }}>Your secure sign-in session stays active for 14 days.</p>
    </form>
  );
}

export function SignupForm() {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.issues?.[0]?.message || "Account creation failed.");
      const result = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      if (result?.error) throw new Error("Your account was created. Please sign in.");
      toast("Your ChronoLux account is ready.");
      router.push("/account");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Account creation failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form-stack" onSubmit={submit}>
      <div><label className="field-label" htmlFor="full-name">Full name</label><input className="field" id="full-name" autoComplete="name" required minLength={2} maxLength={80} value={form.name} onChange={(event) => set("name", event.target.value)} /></div>
      <div className="form-grid">
        <div><label className="field-label" htmlFor="signup-email">Email address</label><input className="field" id="signup-email" type="email" autoComplete="email" required value={form.email} onChange={(event) => set("email", event.target.value)} /></div>
        <div><label className="field-label" htmlFor="phone">Phone number</label><input className="field" id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={(event) => set("phone", event.target.value)} /></div>
      </div>
      <PasswordField label="Password" name="signup-password" value={form.password} onChange={(value) => set("password", value)} autoComplete="new-password" />
      <PasswordField label="Confirm password" name="confirm-password" value={form.confirmPassword} onChange={(value) => set("confirmPassword", value)} autoComplete="new-password" />
      <p className="field-hint">Use 10+ characters with an uppercase and lowercase letter, a number and a symbol.</p>
      {error && <div className="form-error" role="alert">{error}</div>}
      <button className="button button-gold button-full" disabled={busy}>{busy ? "Creating account…" : "Create account"} <LockKeyhole size={14} /></button>
    </form>
  );
}

export function PasswordResetRequestForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await response.json();
      setMessage(data.message || "If that account exists, a reset link will be sent.");
    } finally { setBusy(false); }
  }
  return <form className="form-stack" onSubmit={submit}><div><label className="field-label" htmlFor="reset-email">Email address</label><input className="field" id="reset-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></div>{message && <p className="form-success" role="status">{message}</p>}<button className="button button-gold button-full" disabled={busy}>{busy ? "Sending…" : "Send reset link"}</button></form>;
}

export function PasswordResetForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "This reset link is invalid or expired.");
      router.push("/login?reset=success");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Password reset failed.");
    } finally { setBusy(false); }
  }
  return <form className="form-stack" onSubmit={submit}><PasswordField label="New password" name="reset-password" value={password} onChange={setPassword} autoComplete="new-password" /><PasswordField label="Confirm new password" name="reset-confirm" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" /><p className="field-hint">10+ characters with upper and lower case, a number and a symbol.</p>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-gold button-full" disabled={busy}>{busy ? "Updating…" : "Set new password"}</button></form>;
}
