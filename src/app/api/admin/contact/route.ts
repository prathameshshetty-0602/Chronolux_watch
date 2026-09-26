import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guard";
import { ApiError, jsonError, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 300 });
    return ok({ messages });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const parsed = z.object({ id: z.string().min(1), isRead: z.boolean() }).safeParse(await request.json());
    if (!parsed.success) return jsonError(parsed.error);
    const exists = await prisma.contactMessage.findUnique({ where: { id: parsed.data.id }, select: { id: true } });
    if (!exists) throw new ApiError(404, "Message not found.");
    await prisma.contactMessage.update({ where: { id: parsed.data.id }, data: { isRead: parsed.data.isRead } });
    return ok({ updated: true });
  } catch (error) {
    return jsonError(error);
  }
}
