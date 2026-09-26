import type { Metadata } from "next";
import { ProductBrowser } from "@/components/product-browser";

export const metadata: Metadata = {
  title: "Shop watches",
  description: "Explore the ChronoLux collection of smart, luxury, analog, digital, sports and everyday watches.",
};

export default async function WatchesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb"><span>Home</span><span>/</span><span>Watches</span></div>
          <span className="eyebrow">The collection</span>
          <h1>Find your timepiece.</h1>
          <p>From precision mechanics to connected companions, explore timepieces made for every rhythm and every wrist.</p>
        </div>
      </section>
      <ProductBrowser initialCategory={typeof query.category === "string" ? query.category : ""} initialQuery={typeof query.q === "string" ? query.q : ""} initialGender={typeof query.gender === "string" ? query.gender : ""} initialSort={typeof query.sort === "string" ? query.sort : "newest"} />
    </>
  );
}
