import { z } from "zod";
import { requireUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { jsonError, ok } from "@/lib/http";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(24).optional().or(z.literal("")),
});

export async function GET() {
  try {
    const user = await requireUser();
    const [orders, wishlist, reviews] = await Promise.all([
      prisma.order.count({ where: { userId: user.id } }),
      prisma.wishlistItem.count({ where: { wishlist: { userId: user.id } } }),
      prisma.review.count({ where: { userId: user.id } }),
    ]);
    return ok({ user, stats: { orders, wishlist, reviews } });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const parsed = profileSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError(parsed.error);
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { name: parsed.data.name, phone: parsed.data.phone || null },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });
    return ok({ user: updated });
  } catch (error) {
    return jsonError(error);
  }
}
