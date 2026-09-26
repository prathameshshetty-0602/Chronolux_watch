import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { startCheckout } from "@/lib/order";
import { jsonError, ok } from "@/lib/http";

export async function GET() {
  try {
    const user = await requireUser();
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return ok({ orders });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const result = await startCheckout(user.id, await request.json(), request.url);
    return ok(result, 201);
  } catch (error) {
    return jsonError(error);
  }
}
