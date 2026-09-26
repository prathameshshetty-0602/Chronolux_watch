import type { Metadata } from "next";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = { title: "Contact ChronoLux", description: "Get in touch with the ChronoLux customer care team." };

export default function ContactPage() {
  const socials = [
    { label: "Instagram", href: process.env.NEXT_PUBLIC_INSTAGRAM_URL },
    { label: "Facebook", href: process.env.NEXT_PUBLIC_FACEBOOK_URL },
    { label: "YouTube", href: process.env.NEXT_PUBLIC_YOUTUBE_URL },
  ].filter((social): social is { label: string; href: string } => Boolean(social.href));

  return (
    <>
      <section className="page-hero"><div className="container"><span className="eyebrow">We are here to help</span><h1>Let&apos;s talk about time.</h1><p>Our team can help with choosing a watch, an existing order or care and servicing questions.</p></div></section>
      <section className="container contact-grid">
        <div>
          <div className="contact-info-card"><Mail size={18} /><div><b>Email</b><span>care@chronolux.example</span></div></div>
          <div className="contact-info-card"><Phone size={18} /><div><b>Phone</b><span>+91 80 4567 8900</span></div></div>
          <div className="contact-info-card"><MapPin size={18} /><div><b>Studio</b><span>12, Vittal Mallya Road<br />Bengaluru, Karnataka 560001<br />India</span></div></div>
          <div className="contact-info-card"><Clock3 size={18} /><div><b>Business hours</b><span>Monday–Saturday, 10:00–18:00 IST</span></div></div>
          {socials.length > 0 && <div className="contact-info-card"><div><b>Follow ChronoLux</b><span>{socials.map((social, index) => <span key={social.label}>{index > 0 && " · "}<a className="inline-link" href={social.href} target="_blank" rel="noreferrer">{social.label}</a></span>)}</span></div></div>}
          <p className="field-hint" style={{ marginTop: 19 }}>The contact details above are sample storefront content. Update them for your operating business before launch.</p>
        </div>
        <ContactForm />
      </section>
    </>
  );
}
