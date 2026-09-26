import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleHelp } from "lucide-react";

export const metadata: Metadata = { title: "Watch specifications explained", description: "Understand watch movements, water resistance, displays and materials before you choose." };

const rows = [
  ["How it keeps time", "Sensors and software", "A battery and quartz crystal", "A spring wound by your wrist"],
  ["Display", "Digital touchscreen", "Hands on a dial", "Hands on a dial"],
  ["Power", "Rechargeable battery", "Replaceable battery", "Stored mainspring energy"],
  ["Typical upkeep", "Charge every few days", "Battery service every few years", "Wear regularly or wind by hand"],
  ["Best for", "Notifications, fitness, GPS", "Simple, dependable time", "Craft, tradition and mechanics"],
  ["Care note", "Use a compatible charger", "Replace seals after service", "Keep away from strong shocks"],
];

export default function SpecificationsPage() {
  return (
    <>
      <section className="page-hero"><div className="container"><span className="eyebrow">The watch guide</span><h1>Good details make good choices.</h1><p>A simple guide to movements, displays, materials and ratings—so the specification sheet feels useful, not technical.</p></div></section>
      <section className="container section">
        <div className="prose-copy">
          <h2>Start with the movement</h2><p>A movement is the mechanism that measures and displays time. Smart watches use a computer and rechargeable battery. Quartz watches use a battery-regulated crystal. Mechanical watches store energy in a wound spring; automatic movements wind themselves as the watch moves on your wrist.</p>
          <h2>Smart vs analog vs automatic vs digital</h2><p>Choose a smart watch for connected tools and health summaries. Choose an analog quartz model when you want a traditional dial and low-maintenance accuracy. Automatic and hand-wound watches offer mechanical craft without a battery. Digital watches favour direct readability and practical functions.</p>
        </div>
        <div className="comparison-wrap" style={{ marginTop: 28 }}>
          <table className="comparison">
            <thead><tr><th>Specification</th><th>Smart watch</th><th>Analog quartz</th><th>Automatic</th></tr></thead>
            <tbody>{rows.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </section>
      <section className="container section-tight">
        <div className="feature-grid">
          <article className="feature-card"><CircleHelp size={21} /><h3>Water resistance</h3><p>30 m is splash resistant, 50 m suits swimming, and 100 m is better suited to surface water sports. Ratings follow controlled tests; pressure changes and worn seals affect real use. Check each model&apos;s care guide before water exposure.</p></article>
          <article className="feature-card"><CircleHelp size={21} /><h3>Case size</h3><p>Case diameter is measured across the case, excluding the crown. A smaller number does not always mean a smaller-feeling watch—lug-to-lug length and case shape matter too.</p></article>
          <article className="feature-card"><CircleHelp size={21} /><h3>Materials & crystal</h3><p>Steel balances resilience and finish. Titanium is lighter. Sapphire resists scratches well, while mineral glass is a practical, repairable choice. Leather should be kept dry; silicone suits activity.</p></article>
        </div>
      </section>
      <section className="container section-tight"><div className="newsletter-panel"><div><span className="eyebrow">Ready when you are</span><h2>Find your timepiece.</h2><p>Use the collection filters to compare real product specifications.</p></div><Link className="button button-gold" href="/watches">Browse watches <ArrowRight size={14} /></Link></div></section>
    </>
  );
}
