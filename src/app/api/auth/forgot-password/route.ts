import { createHash, randomBytes } from "node:crypto";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { emailSchema } from "@/lib/validators";
import { jsonError, ok } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const parsed = emailSchema.safeParse((await request.json()).email);
    if (!parsed.success) return ok({ message: "If that account exists, a reset link will be sent." });
    const user = await prisma.user.findUnique({ where: { email: parsed.data }, select: { id: true } });
    if (user && process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
      const rawToken = randomBytes(32).toString("hex");
      const tokenHash = createHash("sha256").update(rawToken).digest("hex");
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
      await prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
      });
      const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
      const link = origin + "/reset-password?token=" + rawToken;
      try {
        await new Resend(process.env.RESEND_API_KEY).emails.send({
          from: process.env.EMAIL_FROM,
          to: parsed.data,
          subject: "Reset your ChronoLux password",
          html: '<p>Use this link to reset your password. It expires in one hour.</p><p><a href="' + link + '">Reset password</a></p>',
        });
      } catch {
        await prisma.passwordResetToken.deleteMany({ where: { tokenHash } });
      }
    }
    return ok({ message: "If that account exists, a reset link will be sent." });
  } catch (error) {
    return jsonError(error);
  }
}
