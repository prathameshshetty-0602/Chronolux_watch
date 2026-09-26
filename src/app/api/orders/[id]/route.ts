import { requireUser } from "@/lib/auth-guard";
import { jsonError, ok, ApiError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const order = await prisma.order.findFirst({
      where: { id, userId: user.id },
      include: { items: true },
    });
    if (!order) throw new ApiError(404, "Order not found.");
    return ok({ order });
  } catch (error) {
    return jsonError(error);
  }
}
