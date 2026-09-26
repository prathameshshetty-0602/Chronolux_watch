import { prisma } from "@/lib/prisma";

export async function refreshProductRating(productId: string) {
  const result = await prisma.review.aggregate({
    where: { productId, status: "PUBLISHED" },
    _avg: { rating: true },
    _count: { _all: true },
  });
  await prisma.product.update({
    where: { id: productId },
    data: { rating: result._avg.rating ?? 0, reviewCount: result._count._all },
  });
}
