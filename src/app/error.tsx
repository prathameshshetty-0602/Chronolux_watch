"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("ChronoLux page error", error.digest ?? error.name);
  }, [error]);

  return (
    <section className="container section">
      <div className="error-panel">
        <span className="eyebrow">A brief pause</span>
        <h2>That page didn&apos;t load.</h2>
        <p>Please try again. If the issue continues, our support team can help.</p>
        <button className="button button-outline" onClick={() => reset()}><RefreshCw size={15} /> Try again</button>
      </div>
    </section>
  );
}
