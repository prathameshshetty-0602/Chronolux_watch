import { requireAdmin } from "@/lib/auth-guard";
import { jsonError, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();
    const reviews = await prisma.review.findMany({
      include: { user: { select: { id: true, name: true, email: true } }, product: { select: { id: true, name: true, slug: true } }, _count: { select: { reports: true } } },
      orderBy: [{ reportCount: "desc" }, { createdAt: "desc" }],
      take: 300,
    });
    return ok({ reviews });
  } catch (error) {
    return jsonError(error);
  }
}
