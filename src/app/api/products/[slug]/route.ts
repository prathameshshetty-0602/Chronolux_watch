import { prisma } from "@/lib/prisma";
import { jsonError, ok, ApiError } from "@/lib/http";
import { productInclude, serializeProduct } from "@/lib/catalog";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const product = await prisma.product.findFirst({
      where: { slug, isActive: true },
      include: { ...productInclude, images: { orderBy: { sortOrder: "asc" } } },
    });
    if (!product) throw new ApiError(404, "We couldn't find that watch.");
    return ok({ product: serializeProduct(product as never) });
  } catch (error) {
    return jsonError(error);
  }
}
