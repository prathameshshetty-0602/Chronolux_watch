import { requireAdmin } from "@/lib/auth-guard";
import { jsonError, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();
    const customers = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true,
        _count: { select: { orders: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    return ok({ customers });
  } catch (error) {
    return jsonError(error);
  }
}
