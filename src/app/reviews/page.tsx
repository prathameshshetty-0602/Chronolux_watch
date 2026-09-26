import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Customer reviews", description: "Verified customer reviews of ChronoLux timepieces." };

export default async function ReviewsPage() {
  let reviews: { id: string; rating: number; title: string; body: string; user: { name: string }; product: { name: string; slug: string } }[] = [];
  try {
    reviews = await prisma.review.findMany({
      where: { status: "PUBLISHED" },
      include: { user: { select: { name: true } }, product: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: 60,
    });
  } catch { /* Empty state handles a disconnected database without exposing internals. */ }
  return (
    <>
      <section className="page-hero"><div className="container"><span className="eyebrow">The ChronoLux community</span><h1>Time, experienced.</h1><p>Customer notes shared after verified purchases. Every review is tied to an order.</p></div></section>
      <section className="container section">
        {reviews.length ? reviews.map((review) => (
          <article className="review-card" key={review.id}>
            <span className="stars">{Array.from({ length: review.rating }).map((_, index) => <Star key={index} size={12} fill="currentColor" strokeWidth={0} />)}</span>
            <span className="verified" style={{ marginLeft: 10 }}><BadgeCheck size={12} /> Verified purchase</span>
            <h3>{review.title}</h3><p>{review.body}</p>
            <small style={{ color: "#858985", fontSize: 9 }}>{review.user.name} · <Link className="inline-link" href={"/reviews/" + review.product.slug}>{review.product.name}</Link></small>
          </article>
        )) : <div className="empty-state"><h3>Customer reviews are coming soon.</h3><p>We publish feedback from verified owners only. Explore the collection and share your experience after your purchase.</p><Link className="button button-gold" href="/watches">Explore watches</Link></div>}
      </section>
    </>
  );
}
