import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guard";
import { ApiError, jsonError, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { refreshProductRating } from "@/lib/reviews";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const parsed = z.object({ status: z.enum(["PUBLISHED", "HIDDEN"]) }).safeParse(await request.json());
    if (!parsed.success) return jsonError(parsed.error);
    const current = await prisma.review.findUnique({ where: { id }, select: { productId: true } });
    if (!current) throw new ApiError(404, "Review not found.");
    const review = await prisma.review.update({ where: { id }, data: { status: parsed.data.status } });
    await refreshProductRating(current.productId);
    return ok({ review });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const current = await prisma.review.findUnique({ where: { id }, select: { productId: true } });
    if (!current) throw new ApiError(404, "Review not found.");
    await prisma.review.delete({ where: { id } });
    await refreshProductRating(current.productId);
    return ok({ deleted: true });
  } catch (error) {
    return jsonError(error);
  }
}
