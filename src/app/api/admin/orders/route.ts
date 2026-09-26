import { requireAdmin } from "@/lib/auth-guard";
import { jsonError, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();
    const orders = await prisma.order.findMany({
      include: { user: { select: { id: true, name: true, email: true } }, items: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return ok({ orders });
  } catch (error) {
    return jsonError(error);
  }
}
