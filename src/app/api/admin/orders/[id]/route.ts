import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guard";
import { ApiError, jsonError, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const statusSchema = z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]);

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const parsed = z.object({ status: statusSchema }).safeParse(await request.json());
    if (!parsed.success) return jsonError(parsed.error);
    const current = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!current) throw new ApiError(404, "Order not found.");
    if (parsed.data.status === "CANCELLED") {
      if (current.paymentStatus === "PAID") {
        throw new ApiError(409, "Paid orders need a gateway refund before they can be cancelled.");
      }
      if (current.status !== "CANCELLED") {
        await prisma.$transaction(async (tx) => {
          const update = await tx.order.updateMany({
            where: { id, status: { not: "CANCELLED" }, paymentStatus: { in: ["PENDING", "TEST_PAID"] } },
            data: { status: "CANCELLED", paymentStatus: current.paymentStatus === "PENDING" ? "FAILED" : "TEST_PAID" },
          });
          if (update.count) {
            for (const item of current.items) {
              if (item.productId) await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
            }
          }
        });
      }
      return ok({ order: await prisma.order.findUnique({ where: { id } }) });
    }
    if (["CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(parsed.data.status)
      && !["PAID", "TEST_PAID"].includes(current.paymentStatus)) {
      throw new ApiError(409, "An order can move forward after its payment is confirmed.");
    }
    const order = await prisma.order.update({ where: { id }, data: { status: parsed.data.status } });
    return ok({ order });
  } catch (error) {
    return jsonError(error);
  }
}
