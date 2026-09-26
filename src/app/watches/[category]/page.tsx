import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductBrowser } from "@/components/product-browser";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug }, select: { name: true, description: true } });
  return {
    title: category ? category.name : "Watches",
    description: category?.description ?? "Explore considered ChronoLux watches.",
  };
}

export default async function WatchCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();
  return (
    <>
      <section className="page-hero"><div className="container"><div className="breadcrumb"><span>Home</span><span>/</span><span>Watches</span><span>/</span><span>{category.name}</span></div><span className="eyebrow">The collection</span><h1>{category.name}.</h1><p>{category.description ?? "Explore the ChronoLux edit."}</p></div></section>
      <ProductBrowser initialCategory={category.slug} />
    </>
  );
}
