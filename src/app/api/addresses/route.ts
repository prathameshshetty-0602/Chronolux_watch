import { z } from "zod";
import { requireUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { addressSchema } from "@/lib/validators";
import { jsonError, ok } from "@/lib/http";

const createSchema = addressSchema.extend({
  isDefault: z.boolean().default(false),
});

export async function GET() {
  try {
    const user = await requireUser();
    const addresses = await prisma.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] });
    return ok({ addresses });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const parsed = createSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError(parsed.error);
    const address = await prisma.$transaction(async (tx) => {
      if (parsed.data.isDefault) await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
      return tx.address.create({ data: { ...parsed.data, userId: user.id } });
    });
    return ok({ address }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
