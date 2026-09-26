import { z } from "zod";
import { requireUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { addressSchema } from "@/lib/validators";
import { ApiError, jsonError, ok } from "@/lib/http";

const updateSchema = addressSchema.extend({ isDefault: z.boolean().optional() });

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError(parsed.error);
    const exists = await prisma.address.findFirst({ where: { id, userId: user.id }, select: { id: true } });
    if (!exists) throw new ApiError(404, "Address not found.");
    const address = await prisma.$transaction(async (tx) => {
      if (parsed.data.isDefault) await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
      return tx.address.update({ where: { id }, data: parsed.data });
    });
    return ok({ address });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    await prisma.address.deleteMany({ where: { id, userId: user.id } });
    return ok({ deleted: true });
  } catch (error) {
    return jsonError(error);
  }
}
