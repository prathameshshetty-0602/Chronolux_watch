import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReviewPanel } from "@/components/review-panel";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findFirst({ where: { slug, isActive: true }, select: { name: true } });
  return { title: product ? "Reviews for " + product.name : "Customer reviews" };
}

export default async function ProductReviewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({ where: { slug, isActive: true }, select: { id: true, name: true, slug: true } });
  if (!product) notFound();
  return (
    <div className="container section">
      <div className="breadcrumb"><Link href="/">Home</Link><span>/</span><Link href={"/product/" + product.slug}>{product.name}</Link><span>/</span><span>Reviews</span></div>
      <span className="eyebrow">ChronoLux owners</span>
      <h1 style={{ margin: "7px 0 28px", fontFamily: "var(--font-display)", fontSize: "clamp(34px,5vw,58px)", fontWeight: 400 }}>Reviews for {product.name}</h1>
      <ReviewPanel productId={product.id} />
    </div>
  );
}
