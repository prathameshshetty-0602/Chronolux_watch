import { createHash } from "node:crypto";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { passwordSchema } from "@/lib/validators";
import { ApiError, jsonError, ok } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = typeof body.token === "string" ? body.token : "";
    const parsedPassword = passwordSchema.safeParse(body.password);
    if (!/^[a-f0-9]{64}$/.test(token) || !parsedPassword.success) {
      throw new ApiError(400, "This reset link is invalid or expired.");
    }
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const record = await prisma.passwordResetToken.findFirst({
      where: { tokenHash, expiresAt: { gt: new Date() } },
      select: { id: true, userId: true },
    });
    if (!record) throw new ApiError(400, "This reset link is invalid or expired.");
    const passwordHash = await hash(parsedPassword.data, 12);
    await prisma.$transaction(async (tx) => {
      const deleted = await tx.passwordResetToken.deleteMany({
        where: { id: record.id, expiresAt: { gt: new Date() } },
      });
      if (!deleted.count) throw new ApiError(400, "This reset link is invalid or expired.");
      await tx.user.update({ where: { id: record.userId }, data: { passwordHash } });
    });
    return ok({ message: "Password updated. Sign in with your new password." });
  } catch (error) {
    return jsonError(error);
  }
}
