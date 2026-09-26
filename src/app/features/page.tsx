import type { Metadata } from "next";
import Link from "next/link";
import { BatteryCharging, Bluetooth, Droplets, Gauge, HeartPulse, MapPin, MoonStar, Radio, Shield, Smartphone, Sun, Watch } from "lucide-react";

export const metadata: Metadata = { title: "Watch features", description: "A clear guide to the features behind smart, sports and traditional ChronoLux watches." };

const features = [
  [Watch, "AMOLED display", "Deep contrast, rich colour and clear detail. Select models include an always-on mode for a quick glance."],
  [MapPin, "GPS & navigation", "Satellite positioning tracks distance, pace and routes without carrying your phone on selected sport models."],
  [HeartPulse, "Health metrics", "Heart-rate, sleep and blood-oxygen readings help you understand daily patterns. These features are not medical devices."],
  [MoonStar, "Sleep tracking", "Overnight movement and rest windows help create a clearer picture of your recovery and routine."],
  [Bluetooth, "Bluetooth connectivity", "Pair a compatible smart watch with your phone for notifications, calling and music controls."],
  [Droplets, "Water resistance", "ATM and metre ratings indicate laboratory pressure resistance. They are not a direct measure of dive depth."],
  [Shield, "Stainless steel", "316L steel is corrosion-resistant and durable, with brushed and polished finishes selected for the design."],
  [Gauge, "Automatic movement", "A rotor winds the movement as you wear it. Mechanical watches do not use a battery and may need periodic servicing."],
  [Radio, "Chronograph timing", "Dedicated pushers start, stop and reset elapsed-time counters on chronograph models."],
  [BatteryCharging, "Long battery life", "From multi-day smart watch use to multi-year quartz cells, power life depends on model and settings."],
  [Sun, "Solar charging", "Light energy is converted into stored power on selected digital models, reducing routine battery changes."],
  [Smartphone, "Wireless pairing", "Companion apps bring notifications and health summaries together on supported iOS and Android phones."],
] as const;

export default function FeaturesPage() {
  return (
    <>
      <section className="page-hero"><div className="container"><span className="eyebrow">Made useful, made clear</span><h1>Features that move with you.</h1><p>Explore the materials, movements and technology behind each ChronoLux timepiece.</p></div></section>
      <section className="container section"><div className="feature-grid">{features.map(([Icon, title, description]) => <article className="feature-card" key={title}><Icon size={22} strokeWidth={1.5} /><h3>{title}</h3><p>{description}</p></article>)}</div></section>
      <section className="container section-tight"><div className="collection-banner"><div className="collection-banner-copy"><span className="eyebrow">Understand the details</span><h2>Find the right movement.</h2><p>Our guide explains the differences between smart, quartz and mechanical timekeeping in simple terms.</p><Link className="text-link" href="/specifications">Read the watch guide <Watch size={14} /></Link></div><div className="collection-art"><Watch size={125} strokeWidth={.7} color="var(--gold)" /></div></div></section>
    </>
  );
}
