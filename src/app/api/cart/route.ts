import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { jsonError, ok, ApiError } from "@/lib/http";
import { productInclude, serializeProduct } from "@/lib/catalog";

const itemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(20).default(1),
  variant: z.string().trim().max(180).optional(),
});

async function readCart(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { where: { product: { isActive: true } }, include: { product: { include: productInclude } }, orderBy: { createdAt: "desc" } } },
  });
  return {
    items: cart?.items.map((item) => ({ id: item.id, productId: item.productId, quantity: item.quantity, variant: item.variant, product: serializeProduct(item.product) })) ?? [],
  };
}

export async function GET() {
  try {
    const user = await requireUser();
    return ok(await readCart(user.id));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const cart = await prisma.cart.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });

    if (body?.action === "merge" && Array.isArray(body.items)) {
      const parsed = z.array(itemSchema).max(100).safeParse(body.items);
      if (!parsed.success) return jsonError(parsed.error);
      await prisma.$transaction(async (tx) => {
        for (const entry of parsed.data) {
          const product = await tx.product.findFirst({ where: { id: entry.productId, isActive: true }, select: { id: true, stock: true } });
          if (!product || product.stock < 1) continue;
          const existing = await tx.cartItem.findUnique({ where: { cartId_productId: { cartId: cart.id, productId: product.id } } });
          const quantity = Math.min(product.stock, 20, (existing?.quantity ?? 0) + entry.quantity);
          await tx.cartItem.upsert({
            where: { cartId_productId: { cartId: cart.id, productId: product.id } },
            create: { cartId: cart.id, productId: product.id, quantity },
            update: { quantity, variant: entry.variant ?? null },
          });
        }
      });
      return ok(await readCart(user.id));
    }

    const parsed = itemSchema.safeParse(body);
    if (!parsed.success) return jsonError(parsed.error);
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({ where: { id: parsed.data.productId, isActive: true } });
      if (!product) throw new ApiError(404, "This watch is no longer available.");
      const existing = await tx.cartItem.findUnique({
        where: { cartId_productId: { cartId: cart.id, productId: product.id } },
      });
      const quantity = (existing?.quantity ?? 0) + parsed.data.quantity;
      if (quantity > product.stock || quantity > 20) throw new ApiError(409, "There isn't enough stock for that quantity.");
      await tx.cartItem.upsert({
        where: { cartId_productId: { cartId: cart.id, productId: product.id } },
        create: { cartId: cart.id, productId: product.id, quantity: parsed.data.quantity },
        update: { quantity, variant: parsed.data.variant ?? null },
      });
    });
    return ok(await readCart(user.id), 201);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    const parsed = itemSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError(parsed.error);
    const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    const product = await prisma.product.findFirst({ where: { id: parsed.data.productId, isActive: true }, select: { stock: true } });
    if (!cart || !product) throw new ApiError(404, "Cart item not found.");
    if (parsed.data.quantity > product.stock) throw new ApiError(409, "There isn't enough stock for that quantity.");
    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId: parsed.data.productId } },
      create: { cartId: cart.id, productId: parsed.data.productId, quantity: parsed.data.quantity, variant: parsed.data.variant ?? null },
      update: { quantity: parsed.data.quantity, variant: parsed.data.variant ?? null },
    });
    return ok(await readCart(user.id));
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireUser();
    const productId = new URL(request.url).searchParams.get("productId");
    if (!productId) throw new ApiError(400, "A product ID is required.");
    const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
    return ok(await readCart(user.id));
  } catch (error) {
    return jsonError(error);
  }
}
