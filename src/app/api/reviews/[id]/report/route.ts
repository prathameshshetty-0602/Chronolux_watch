import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { ApiError, jsonError, ok } from "@/lib/http";
import { refreshProductRating } from "@/lib/reviews";

const schema = z.object({ reason: z.string().trim().max(240).optional() });

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return jsonError(parsed.error);
    const review = await prisma.review.findUnique({ where: { id }, select: { id: true, userId: true, productId: true, status: true } });
    if (!review || review.status !== "PUBLISHED") throw new ApiError(404, "Review not found.");
    if (review.userId === user.id) throw new ApiError(400, "You can't report your own review.");
    await prisma.$transaction(async (tx) => {
      await tx.reviewReport.create({ data: { reviewId: id, userId: user.id, reason: parsed.data.reason || null } });
      const reportCount = await tx.reviewReport.count({ where: { reviewId: id } });
      await tx.review.update({ where: { id }, data: { reportCount, ...(reportCount >= 5 ? { status: "HIDDEN" as const } : {}) } });
    });
    await refreshProductRating(review.productId);
    return ok({ reported: true });
  } catch (error) {
    return jsonError(error);
  }
}
