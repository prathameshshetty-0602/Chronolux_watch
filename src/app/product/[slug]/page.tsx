import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductDetailClient } from "@/components/product-detail-client";
import { ProductGrid, SectionHeading } from "@/components/store-ui";
import { serializeProduct } from "@/lib/catalog";
import type { StoreProduct } from "@/types/store";

export const dynamic = "force-dynamic";

async function findProduct(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      brand: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await findProduct(slug);
    if (!product) return { title: "Watch not found" };
    return {
      title: product.name,
      description: product.description.slice(0, 155),
      openGraph: {
        title: product.name + " — ChronoLux",
        description: product.description.slice(0, 155),
        images: product.images[0] ? [product.images[0].url] : [],
      },
    };
  } catch {
    return { title: "ChronoLux watches" };
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let record;
  let related: StoreProduct[] = [];
  try {
    record = await findProduct(slug);
    if (record) {
      const products = await prisma.product.findMany({
        where: { isActive: true, id: { not: record.id }, categoryId: record.categoryId },
        include: {
          brand: { select: { name: true, slug: true } },
          category: { select: { name: true, slug: true } },
          images: { orderBy: { sortOrder: "asc" }, take: 4 },
        },
        take: 4,
        orderBy: { isFeatured: "desc" },
      });
      related = products.map((product) => serializeProduct(product) as StoreProduct);
    }
  } catch {
    return (
      <section className="container section"><div className="error-panel"><h2>Watch details are temporarily unavailable.</h2><p>Please refresh in a moment or continue browsing the collection.</p><Link className="text-link" href="/watches">Browse watches <ChevronRight size={14} /></Link></div></section>
    );
  }
  if (!record) notFound();
  const product = serializeProduct(record) as StoreProduct;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.model,
    brand: { "@type": "Brand", name: product.brand.name },
    image: product.images.map((image) => image.url),
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    aggregateRating: product.reviewCount ? { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount } : undefined,
  };
  const json = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
      <div className="container">
        <div className="breadcrumb" style={{ paddingTop: 22 }}><Link href="/">Home</Link><span>/</span><Link href="/watches">Watches</Link><span>/</span><Link href={"/watches?category=" + product.category.slug}>{product.category.name}</Link><span>/</span><span>{product.name}</span></div>
        <ProductDetailClient product={product} />
        <section className="section-tight">
          <div className="detail-tabs">
            <div>
              <span className="eyebrow">Thoughtful by design</span>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 29 }}>The details</h2>
              <p className="detail-description">{product.description}</p>
              <ul className="feature-list">{product.features.map((feature) => <li key={feature}><Check size={15} />{feature}</li>)}</ul>
              <Link className="text-link" href={"/reviews/" + product.slug}>Read customer reviews <ChevronRight size={14} /></Link>
            </div>
            <div>
              <span className="eyebrow">At a glance</span>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 29 }}>Specifications</h2>
              <table className="spec-table"><tbody>{Object.entries(product.specs).map(([key, value]) => <tr key={key}><th>{key}</th><td>{String(value)}</td></tr>)}</tbody></table>
            </div>
          </div>
        </section>
        <section className="section">
          <SectionHeading eyebrow="A natural companion" title="Customers also bought" href={"/watches?category=" + product.category.slug} />
          <ProductGrid products={related} empty="More pieces from this edit are coming soon." />
        </section>
        <section className="section-tight">
          <SectionHeading eyebrow="Keep exploring" title="Similar watches" href="/watches" />
          <ProductGrid products={related.slice().reverse()} />
        </section>
      </div>
    </>
  );
}
