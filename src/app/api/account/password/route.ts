import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { requireUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { jsonError, ok, ApiError } from "@/lib/http";
import { passwordSchema } from "@/lib/validators";

const schema = z.object({ currentPassword: z.string().min(1), newPassword: passwordSchema });

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return jsonError(parsed.error);
    const record = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
    if (!record || !(await compare(parsed.data.currentPassword, record.passwordHash))) {
      throw new ApiError(400, "Your current password is incorrect.");
    }
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hash(parsed.data.newPassword, 12) } });
    return ok({ message: "Password updated." });
  } catch (error) {
    return jsonError(error);
  }
}
