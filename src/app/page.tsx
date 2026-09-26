import Image from "next/image";
import Link from "next/link";
import { Activity, ArrowDownRight, ArrowRight, CircleDot, Gem, Heart, ShieldCheck, Watch } from "lucide-react";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { productInclude, serializeProduct } from "@/lib/catalog";
import { CollectionCard, NewsletterSignup, ProductGrid, SectionHeading } from "@/components/store-ui";
import type { StoreProduct } from "@/types/store";

export const dynamic = "force-dynamic";

async function loadProducts(where: Prisma.ProductWhereInput, take = 4): Promise<StoreProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: { ...where, isActive: true },
      include: productInclude,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take,
    });
    return products.map(serializeProduct) as StoreProduct[];
  } catch {
    return [];
  }
}

async function loadReviews() {
  try {
    return await prisma.review.findMany({
      where: { status: "PUBLISHED" },
      include: { user: { select: { name: true } }, product: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featured, trending, newArrivals, luxury, smart, sports, men, women, offers, reviews] = await Promise.all([
    loadProducts({ isFeatured: true }, 4),
    loadProducts({ isTrending: true }, 4),
    loadProducts({ isNewArrival: true }, 4),
    loadProducts({ type: "LUXURY" }, 4),
    loadProducts({ type: "SMART" }, 4),
    loadProducts({ type: "SPORTS" }, 4),
    loadProducts({ gender: "MEN" }, 4),
    loadProducts({ gender: "WOMEN" }, 4),
    loadProducts({ compareAtPrice: { not: null } }, 4),
    loadReviews(),
  ]);

  return (
    <>
      <section className="hero">
        <div className="container hero-copy">
          <div className="hero-kicker">Precision for the present</div>
          <h1>TIME,<br /><em>ENGINEERED</em><br />FOR YOU.</h1>
          <p>Timepieces that bring considered design and everyday performance into perfect alignment.</p>
          <div className="hero-actions">
            <Link className="button button-gold" href="/watches">Shop collection <ArrowRight size={15} /></Link>
            <Link className="button button-outline" href="/features">Explore watches <ArrowDownRight size={15} /></Link>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-glow" />
          <Image className="hero-watch" src="/watches/watch-01.svg" alt="" width={720} height={800} priority />
        </div>
        <span className="hero-meta">Collection 01 &nbsp; / &nbsp; The enduring form</span>
      </section>

      <div className="container category-strip" aria-label="Shop by collection">
        <Link className="category-tile" href="/watches?category=smart-watches"><Activity size={19} /><span>Smart</span><small>Stay connected</small></Link>
        <Link className="category-tile" href="/watches?category=luxury-watches"><Gem size={19} /><span>Luxury</span><small>Made to endure</small></Link>
        <Link className="category-tile" href="/watches?category=analog-watches"><Watch size={19} /><span>Analog</span><small>Timeless form</small></Link>
        <Link className="category-tile" href="/watches?category=sports-watches"><Activity size={19} /><span>Sports</span><small>Go further</small></Link>
        <Link className="category-tile" href="/watches?category=womens-watches"><CircleDot size={19} /><span>For her</span><small>Quietly distinctive</small></Link>
        <Link className="category-tile" href="/watches?category=kids-watches"><Heart size={19} /><span>For kids</span><small>Small adventures</small></Link>
      </div>

      <section className="container section">
        <SectionHeading eyebrow="Considered, always" title="Featured timepieces" description="A closer look at the watches shaping the ChronoLux collection." href="/watches" />
        <ProductGrid products={featured} empty="Our featured collection is being prepared." />
      </section>

      <section className="container section-tight">
        <CollectionCard href="/watches?category=luxury-watches" title="The art of keeping time." description="A study in fine materials, proportion and mechanics. Discover the pieces made for a lifetime of wear." image="/watches/watch-07.svg" />
      </section>

      <section className="container section">
        <SectionHeading eyebrow="In motion" title="Trending now" description="The pieces our community is wearing this season." href="/watches?sort=popular" />
        <ProductGrid products={trending} />
      </section>

      <section className="section" style={{ background: "#0d1012", borderBlock: "1px solid var(--line)" }}>
        <div className="container">
          <SectionHeading eyebrow="Just arrived" title="New arrivals" description="Fresh design, thoughtful details and a new point of view." href="/watches?sort=newest" />
          <ProductGrid products={newArrivals} />
        </div>
      </section>

      <section className="container section">
        <SectionHeading eyebrow="The long view" title="Luxury, with intention" href="/watches?category=luxury-watches" />
        <ProductGrid products={luxury} />
      </section>

      <section className="container section-tight">
        <div className="feature-grid">
          <Link href="/watches?category=smart-watches" className="feature-card"><Activity size={22} /><h3>Smarter by design</h3><p>Connected features, made intuitive. Browse the ChronoLux smart collection.</p></Link>
          <Link href="/watches?category=sports-watches" className="feature-card"><ShieldCheck size={22} /><h3>Made to move</h3><p>Purpose-built performance for the sessions and journeys that stay with you.</p></Link>
          <Link href="/specifications" className="feature-card"><Watch size={22} /><h3>Find your movement</h3><p>Understand the details behind automatic, quartz and connected watches.</p></Link>
        </div>
      </section>

      <section className="container section">
        <SectionHeading eyebrow="Connected time" title="Smart, without compromise" href="/watches?category=smart-watches" />
        <ProductGrid products={smart} />
      </section>

      <section className="container section-tight">
        <SectionHeading eyebrow="Built for the elements" title="Sport & outdoors" href="/watches?category=sports-watches" />
        <ProductGrid products={sports} />
      </section>

      <section className="container section">
        <SectionHeading eyebrow="A considered edit" title="For him" href="/watches?gender=men" />
        <ProductGrid products={men} />
      </section>

      <section className="container section-tight">
        <SectionHeading eyebrow="A considered edit" title="For her" href="/watches?gender=women" />
        <ProductGrid products={women} />
      </section>

      <section className="container section">
        <div className="section-heading">
          <div><span className="eyebrow">The ChronoLux community</span><h2>Worn, remembered, loved.</h2><p>Notes from customers who have made their timepiece their own.</p></div>
          <Link className="text-link" href="/watches">Find your watch <ArrowRight size={14} /></Link>
        </div>
        {reviews.length ? (
          <div className="feature-grid">
            {reviews.map((review) => (
              <article className="review-quote" key={review.id}>
                <div className="stars" aria-label={review.rating + " out of 5"}>{"★".repeat(review.rating)}<small>Verified purchase</small></div>
                <blockquote>“{review.body}”</blockquote>
                <small>{review.user.name} · {review.product.name}</small>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state"><span className="eyebrow">A new collection</span><h3>Your story belongs here.</h3><p>Our first customer reviews will appear after verified purchases. Explore the collection and leave a note about your watch.</p></div>
        )}
      </section>

      <section className="container section-tight">
        <div className="newsletter-panel">
          <div><span className="eyebrow">A little more time well spent</span><h2>Letters from ChronoLux.</h2><p>First access to new collections, considered notes and member-only offers.</p></div>
          <NewsletterSignup />
        </div>
      </section>

      <section className="container section-tight">
        <SectionHeading eyebrow="The considered selection" title="Offers, with nothing held back" href="/watches?sort=discount" />
        <ProductGrid products={offers} />
      </section>
    </>
  );
}
