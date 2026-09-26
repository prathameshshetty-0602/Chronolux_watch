import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { reviewSchema } from "@/lib/validators";
import { ApiError, jsonError, ok } from "@/lib/http";
import { refreshProductRating } from "@/lib/reviews";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const productId = params.get("productId");
    if (!productId) throw new ApiError(400, "A product ID is required.");
    const session = await auth();
    const sort = params.get("sort");
    const orderBy = sort === "highest" ? { rating: "desc" as const } : sort === "lowest" ? { rating: "asc" as const } : { createdAt: "desc" as const };
    const [reviews, aggregate, distribution] = await Promise.all([
      prisma.review.findMany({
        where: { productId, status: "PUBLISHED" },
        include: { user: { select: { name: true } } },
        orderBy,
        take: 100,
      }),
      prisma.review.aggregate({ where: { productId, status: "PUBLISHED" }, _avg: { rating: true }, _count: { _all: true } }),
      prisma.review.groupBy({ by: ["rating"], where: { productId, status: "PUBLISHED" }, _count: { _all: true } }),
    ]);
    const [myReview, purchase] = session?.user?.id ? await Promise.all([
      prisma.review.findUnique({ where: { userId_productId: { userId: session.user.id, productId } } }),
      prisma.orderItem.findFirst({
        where: {
          productId,
          order: {
            userId: session.user.id,
            paymentStatus: { in: process.env.NODE_ENV === "production" ? ["PAID"] : ["PAID", "TEST_PAID"] },
          },
        },
        select: { id: true },
      }),
    ]) : [null, null];
    return ok({
      reviews: reviews.map((review) => ({
        id: review.id, rating: review.rating, title: review.title, body: review.body,
        createdAt: review.createdAt, name: review.user.name, verifiedPurchase: true,
      })),
      average: aggregate._avg.rating ?? 0,
      count: aggregate._count._all,
      canReview: Boolean(purchase),
      myReview: myReview ? { id: myReview.id, rating: myReview.rating, title: myReview.title, body: myReview.body, status: myReview.status } : null,
      signedIn: Boolean(session?.user?.id),
      distribution: Object.fromEntries([1, 2, 3, 4, 5].map((rating) => [
        rating,
        distribution.find((item) => item.rating === rating)?._count._all ?? 0,
      ])),
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const parsed = reviewSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError(parsed.error);
    const product = await prisma.product.findFirst({ where: { id: parsed.data.productId, isActive: true }, select: { id: true } });
    if (!product) throw new ApiError(404, "Watch not found.");
    const allowedPayments = process.env.NODE_ENV === "production" ? ["PAID" as const] : ["PAID" as const, "TEST_PAID" as const];
    const purchase = await prisma.orderItem.findFirst({
      where: { productId: product.id, order: { userId: user.id, paymentStatus: { in: allowedPayments } } },
      select: { id: true },
    });
    if (!purchase) throw new ApiError(403, "A verified purchase is required before reviewing this watch.");
    const review = await prisma.review.create({
      data: { ...parsed.data, userId: user.id },
      select: { id: true, productId: true, rating: true, title: true, body: true, createdAt: true },
    });
    await refreshProductRating(product.id);
    return ok({ review }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
