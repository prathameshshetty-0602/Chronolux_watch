import { ProductType, Gender } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { jsonError, ok } from "@/lib/http";
import { productInclude, serializeProduct } from "@/lib/catalog";

const sortOptions: Record<string, object[]> = {
  "price-asc": [{ price: "asc" }],
  "price-desc": [{ price: "desc" }],
  newest: [{ createdAt: "desc" }],
  popular: [{ reviewCount: "desc" }, { createdAt: "desc" }],
  rating: [{ rating: "desc" }, { reviewCount: "desc" }],
  discount: [{ compareAtPrice: "desc" }, { price: "asc" }],
};

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const page = Math.max(1, Number(params.get("page")) || 1);
    const limit = Math.min(48, Math.max(1, Number(params.get("limit")) || 12));
    const q = params.get("q")?.trim().slice(0, 120);
    const category = params.get("category")?.trim();
    const brand = params.get("brand")?.trim();
    const minPrice = Number(params.get("minPrice"));
    const maxPrice = Number(params.get("maxPrice"));
    const gender = params.get("gender")?.toUpperCase();
    const type = params.get("type")?.toUpperCase();
    const rating = Number(params.get("rating"));
    const where = {
      isActive: true,
      ...(category ? { category: { slug: category } } : {}),
      ...(brand ? { brand: { slug: brand } } : {}),
      ...(gender && Object.values(Gender).includes(gender as Gender) ? { gender: gender as Gender } : {}),
      ...(type && Object.values(ProductType).includes(type as ProductType) ? { type: type as ProductType } : {}),
      ...(Number.isFinite(minPrice) && minPrice >= 0 || Number.isFinite(maxPrice) && maxPrice > 0
        ? { price: { ...(Number.isFinite(minPrice) && minPrice >= 0 ? { gte: minPrice } : {}), ...(Number.isFinite(maxPrice) && maxPrice > 0 ? { lte: maxPrice } : {}) } }
        : {}),
      ...(rating >= 1 && rating <= 5 ? { rating: { gte: rating } } : {}),
      ...(params.get("availability") === "in-stock" ? { stock: { gt: 0 } } : {}),
      ...(params.get("strap") ? { strapMaterial: { contains: params.get("strap")!, mode: "insensitive" as const } } : {}),
      ...(params.get("case") ? { caseMaterial: { contains: params.get("case")!, mode: "insensitive" as const } } : {}),
      ...(params.get("display") ? { displayType: { contains: params.get("display")!, mode: "insensitive" as const } } : {}),
      ...(Number(params.get("water")) > 0 ? { waterResistance: { gte: Number(params.get("water")) } } : {}),
      ...(q ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { model: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
          { brand: { name: { contains: q, mode: "insensitive" as const } } },
          { category: { name: { contains: q, mode: "insensitive" as const } } },
          { tags: { has: q.toLowerCase() } },
        ],
      } : {}),
    };
    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: sortOptions[params.get("sort") ?? "newest"] ?? sortOptions.newest,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return ok({
      products: products.map(serializeProduct),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return jsonError(error);
  }
}
