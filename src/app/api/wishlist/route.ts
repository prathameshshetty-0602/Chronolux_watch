import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { jsonError, ok, ApiError } from "@/lib/http";
import { productInclude, serializeProduct } from "@/lib/catalog";

export async function GET() {
  try {
    const user = await requireUser();
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: user.id },
      include: { items: { where: { product: { isActive: true } }, include: { product: { include: productInclude } }, orderBy: { createdAt: "desc" } } },
    });
    return ok({ items: wishlist?.items.map((item) => ({ id: item.id, productId: item.productId, product: serializeProduct(item.product) })) ?? [] });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const parsed = z.object({ productId: z.string().min(1) }).safeParse(await request.json());
    if (!parsed.success) return jsonError(parsed.error);
    const product = await prisma.product.findFirst({ where: { id: parsed.data.productId, isActive: true }, select: { id: true } });
    if (!product) throw new ApiError(404, "This watch is no longer available.");
    const wishlist = await prisma.wishlist.upsert({ where: { userId: user.id }, create: { userId: user.id }, update: {} });
    await prisma.wishlistItem.upsert({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId: product.id } },
      create: { wishlistId: wishlist.id, productId: product.id },
      update: {},
    });
    return ok({ saved: true }, 201);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireUser();
    const productId = new URL(request.url).searchParams.get("productId");
    if (!productId) throw new ApiError(400, "A product ID is required.");
    const wishlist = await prisma.wishlist.findUnique({ where: { userId: user.id } });
    if (wishlist) await prisma.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id, productId } });
    return ok({ saved: false });
  } catch (error) {
    return jsonError(error);
  }
}
