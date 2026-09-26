import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth-guard";
import { jsonError, ok, ApiError } from "@/lib/http";
import { productSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";

async function relations(categorySlug: string, brandSlug: string) {
  const [category, brand] = await Promise.all([
    prisma.category.findUnique({ where: { slug: categorySlug }, select: { id: true } }),
    prisma.brand.findUnique({ where: { slug: brandSlug }, select: { id: true } }),
  ]);
  if (!category || !brand) throw new ApiError(400, "Choose an existing category and brand.");
  return { categoryId: category.id, brandId: brand.id };
}

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const q = new URL(request.url).searchParams.get("q")?.trim();
    const products = await prisma.product.findMany({
      where: q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { model: { contains: q, mode: "insensitive" } }] } : {},
      include: { brand: true, category: true, images: { orderBy: { sortOrder: "asc" } } },
      orderBy: { updatedAt: "desc" },
      take: 200,
    });
    return ok({ products: products.map((product) => ({
      ...product, price: Number(product.price), compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    })) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const parsed = productSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError(parsed.error);
    const input = parsed.data;
    const related = await relations(input.categorySlug, input.brandSlug);
    const { categorySlug, brandSlug, images, ...fields } = input;
    void categorySlug;
    void brandSlug;
    const product = await prisma.product.create({
      data: {
        ...fields,
        ...related,
        price: new Prisma.Decimal(fields.price),
        compareAtPrice: fields.compareAtPrice ? new Prisma.Decimal(fields.compareAtPrice) : null,
        specs: fields.specs,
        images: { create: images.map((image, sortOrder) => ({ ...image, sortOrder })) },
      },
      include: { brand: true, category: true, images: true },
    });
    return ok({ product }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
