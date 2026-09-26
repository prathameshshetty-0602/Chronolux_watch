import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://chronolux.example";
  const staticRoutes = ["", "/watches", "/features", "/specifications", "/reviews", "/contact"];
  const routes: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: baseUrl + route,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
      prisma.category.findMany({ select: { slug: true, createdAt: true } }),
    ]);
    routes.push(...categories.map((category) => ({
      url: baseUrl + "/watches/" + category.slug,
      lastModified: category.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })));
    routes.push(...products.map((product) => ({
      url: baseUrl + "/product/" + product.slug,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })));
  } catch {
    // Static storefront routes remain available if the database is temporarily offline.
  }
  return routes;
}
