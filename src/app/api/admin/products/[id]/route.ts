import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth-guard";
import { ApiError, jsonError, ok } from "@/lib/http";
import { productSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const parsed = productSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError(parsed.error);
    const input = parsed.data;
    const [category, brand] = await Promise.all([
      prisma.category.findUnique({ where: { slug: input.categorySlug }, select: { id: true } }),
      prisma.brand.findUnique({ where: { slug: input.brandSlug }, select: { id: true } }),
    ]);
    if (!category || !brand) throw new ApiError(400, "Choose an existing category and brand.");
    const { categorySlug, brandSlug, images, ...fields } = input;
    void categorySlug;
    void brandSlug;
    const product = await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: id } });
      return tx.product.update({
        where: { id },
        data: {
          ...fields,
          categoryId: category.id,
          brandId: brand.id,
          price: new Prisma.Decimal(fields.price),
          compareAtPrice: fields.compareAtPrice ? new Prisma.Decimal(fields.compareAtPrice) : null,
          images: { create: images.map((image, sortOrder) => ({ ...image, sortOrder })) },
        },
        include: { brand: true, category: true, images: true },
      });
    });
    return ok({ product });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const product = await prisma.product.update({ where: { id }, data: { isActive: false } });
    return ok({ deleted: true, productId: product.id });
  } catch (error) {
    return jsonError(error);
  }
}
