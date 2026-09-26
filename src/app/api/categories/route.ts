import { prisma } from "@/lib/prisma";
import { jsonError, ok } from "@/lib/http";

export async function GET() {
  try {
    const [categories, brands] = await Promise.all([
      prisma.category.findMany({
        orderBy: { name: "asc" },
        include: { _count: { select: { products: { where: { isActive: true } } } } },
      }),
      prisma.brand.findMany({ orderBy: { name: "asc" } }),
    ]);
    return ok({
      categories: categories.map(({ _count, ...category }) => ({ ...category, productCount: _count.products })),
      brands,
      types: ["SMART", "LUXURY", "ANALOG", "DIGITAL", "SPORTS", "CASUAL", "AUTOMATIC", "MECHANICAL", "CHRONOGRAPH", "COUPLE"],
      genders: ["MEN", "WOMEN", "KIDS", "UNISEX", "COUPLES"],
    });
  } catch (error) {
    return jsonError(error);
  }
}
