import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { ApiError, jsonError, ok } from "@/lib/http";
import { refreshProductRating } from "@/lib/reviews";

const editSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(3).max(100),
  body: z.string().trim().min(20).max(3000),
});

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const parsed = editSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError(parsed.error);
    const review = await prisma.review.findFirst({ where: { id, userId: user.id }, select: { id: true, productId: true } });
    if (!review) throw new ApiError(404, "Review not found.");
    const updated = await prisma.review.update({ where: { id }, data: parsed.data });
    await refreshProductRating(review.productId);
    return ok({ review: updated });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const review = await prisma.review.findFirst({ where: { id, userId: user.id }, select: { id: true, productId: true } });
    if (!review) throw new ApiError(404, "Review not found.");
    await prisma.review.delete({ where: { id } });
    await refreshProductRating(review.productId);
    return ok({ deleted: true });
  } catch (error) {
    return jsonError(error);
  }
}
