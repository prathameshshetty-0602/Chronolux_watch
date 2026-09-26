"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { useToast } from "@/components/toast-provider";

export function ContactForm() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.issues?.[0]?.message || "Message could not be sent.");
      toast(data.message);
      event.currentTarget.reset();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Message could not be sent.");
    } finally { setBusy(false); }
  }
  return (
    <form className="contact-form form-stack" onSubmit={submit}>
      <div className="form-grid">
        <div><label className="field-label" htmlFor="contact-name">Name</label><input className="field" id="contact-name" name="name" autoComplete="name" required minLength={2} /></div>
        <div><label className="field-label" htmlFor="contact-email">Email</label><input className="field" id="contact-email" name="email" type="email" autoComplete="email" required /></div>
      </div>
      <div className="form-grid">
        <div><label className="field-label" htmlFor="contact-phone">Phone</label><input className="field" id="contact-phone" name="phone" type="tel" autoComplete="tel" /></div>
        <div><label className="field-label" htmlFor="contact-subject">Subject</label><input className="field" id="contact-subject" name="subject" required minLength={3} maxLength={160} /></div>
      </div>
      <div><label className="field-label" htmlFor="contact-message">Message</label><textarea className="field" id="contact-message" name="message" rows={6} required minLength={10} maxLength={5000} style={{ resize: "vertical" }} /></div>
      <div className="honeypot" aria-hidden="true"><label htmlFor="website">Website</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-gold" disabled={busy}>{busy ? "Sending…" : "Send message"} <Send size={14} /></button>
      <p className="field-hint">We usually reply within one business day.</p>
    </form>
  );
}
