import { prisma } from "@/lib/prisma";
import { jsonError, ok } from "@/lib/http";

export async function GET(request: Request) {
  try {
    const q = new URL(request.url).searchParams.get("q")?.trim().slice(0, 80) ?? "";
    if (q.length < 2) return ok({ suggestions: [] });
    const suggestions = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { model: { contains: q, mode: "insensitive" } },
          { brand: { name: { contains: q, mode: "insensitive" } } },
          { category: { name: { contains: q, mode: "insensitive" } } },
        ],
      },
      select: {
        name: true, slug: true, price: true,
        brand: { select: { name: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true, alt: true } },
      },
      take: 6,
      orderBy: { reviewCount: "desc" },
    });
    return ok({ suggestions: suggestions.map((product) => ({ ...product, price: Number(product.price) })) });
  } catch (error) {
    return jsonError(error);
  }
}
