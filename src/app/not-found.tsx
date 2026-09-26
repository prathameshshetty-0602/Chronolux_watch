import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";

export default function NotFound() {
  return (
    <section className="container section">
      <div className="empty-state">
        <Clock3 size={34} color="var(--gold)" />
        <h3>We couldn&apos;t find that page.</h3>
        <p>The page may have moved. Browse the latest ChronoLux collection instead.</p>
        <Link className="button button-gold" href="/watches">Explore watches <ArrowRight size={15} /></Link>
      </div>
    </section>
  );
}
