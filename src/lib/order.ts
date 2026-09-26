import Stripe from "stripe";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/http";
import { addressSchema } from "@/lib/validators";
import { storeConfig } from "@/lib/store-config";

const stripeKey = process.env.STRIPE_SECRET_KEY;

function stripeClient() {
  if (!stripeKey) throw new ApiError(503, "Online payments are not configured yet.");
  return new Stripe(stripeKey);
}

function asNumber(value: Prisma.Decimal | number) {
  return Number(value);
}

export async function startCheckout(userId: string, input: unknown, requestUrl: string) {
  const body = input as { addressId?: unknown; address?: unknown } | null;
  let addressId: string | null = null;
  let address: Record<string, string>;

  if (typeof body?.addressId === "string" && body.addressId.length > 0) {
    const saved = await prisma.address.findFirst({
      where: { id: body.addressId, userId },
    });
    if (!saved) throw new ApiError(404, "Choose one of your saved addresses.");
    addressId = saved.id;
    address = {
      fullName: saved.fullName, phone: saved.phone, line1: saved.line1,
      line2: saved.line2 ?? "", city: saved.city, state: saved.state,
      country: saved.country, postalCode: saved.postalCode,
    };
  } else {
    const parsed = addressSchema.safeParse(body?.address);
    if (!parsed.success) throw new ApiError(400, "Enter a complete shipping address.");
    address = parsed.data;
  }

  const mode = process.env.PAYMENT_MODE ?? "stripe";
  const testMode = mode === "mock";
  if (testMode && process.env.NODE_ENV === "production") {
    throw new ApiError(503, "Test payments are disabled in production.");
  }
  if (!testMode && !stripeKey) {
    throw new ApiError(503, "Payments are unavailable until the store owner configures Stripe.");
  }

  const order = await prisma.$transaction(async (tx) => {
    if (!addressId) {
      const savedAddress = await tx.address.create({
        data: {
          userId,
          label: address.label || "Checkout",
          fullName: address.fullName,
          phone: address.phone,
          line1: address.line1,
          line2: address.line2 || null,
          city: address.city,
          state: address.state,
          country: address.country || "India",
          postalCode: address.postalCode,
        },
      });
      addressId = savedAddress.id;
    }

    const cart = await tx.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
            },
          },
        },
      },
    });
    if (!cart?.items.length) throw new ApiError(400, "Your cart is empty.");
    if (cart.items.some((item) => !item.product.isActive)) {
      throw new ApiError(409, "A product in your cart is no longer available. Refresh your cart.");
    }

    let subtotal = 0;
    let discount = 0;
    for (const item of cart.items) {
      if (item.quantity > item.product.stock) {
        throw new ApiError(409, item.product.name + " no longer has enough stock.");
      }
      const price = asNumber(item.product.price);
      subtotal += price * item.quantity;
      if (item.product.compareAtPrice) {
        discount += Math.max(0, asNumber(item.product.compareAtPrice) - price) * item.quantity;
      }
    }
    subtotal = Math.round(subtotal * 100) / 100;
    discount = Math.round(discount * 100) / 100;
    const tax = Math.round(subtotal * storeConfig.taxRate * 100) / 100;
    const shipping = subtotal >= storeConfig.freeShippingThreshold ? 0 : storeConfig.standardShippingFee;
    const total = Math.round((subtotal + tax + shipping) * 100) / 100;

    for (const item of cart.items) {
      const reserved = await tx.product.updateMany({
        where: { id: item.productId, isActive: true, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (reserved.count !== 1) throw new ApiError(409, "Stock changed while checking out. Refresh your cart.");
    }

    const orderNumber = "CL-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    const created = await tx.order.create({
      data: {
        orderNumber,
        userId,
        addressId,
        addressSnapshot: address,
        subtotal,
        discount,
        tax,
        shipping,
        total,
        paymentProvider: testMode ? "development-mock" : "stripe",
        paymentStatus: testMode ? "TEST_PAID" : "PENDING",
        status: testMode ? "CONFIRMED" : "PENDING",
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            productSlug: item.product.slug,
            imageUrl: item.product.images[0]?.url ?? "/watches/watch-01.svg",
            quantity: item.quantity,
            variant: item.variant,
            unitPrice: item.product.price,
            listPrice: item.product.compareAtPrice ?? item.product.price,
            lineTotal: asNumber(item.product.price) * item.quantity,
          })),
        },
      },
      include: { items: true },
    });
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return created;
  });

  if (testMode) {
    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentMode: "test",
      message: "Development test order created. No payment was taken.",
    };
  }

  try {
    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(requestUrl).origin;
    const gateway = stripeClient();
    const session = await gateway.checkout.sessions.create({
      mode: "payment",
      currency: "inr",
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "inr",
          unit_amount: Math.round(asNumber(order.total) * 100),
          product_data: { name: "ChronoLux order " + order.orderNumber },
        },
      }],
      metadata: { orderId: order.id, userId },
      success_url: origin + "/checkout/complete?order=" + order.id,
      cancel_url: origin + "/checkout?cancelled=1",
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
    });
    if (!session.url) throw new Error("Stripe did not return a Checkout URL.");
    try {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentSessionId: session.id },
      });
    } catch (error) {
      await gateway.checkout.sessions.expire(session.id).catch(() => undefined);
      throw error;
    }
    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentMode: "stripe",
      checkoutUrl: session.url,
    };
  } catch (error) {
    await releaseOrder(order.id, "FAILED");
    if (error instanceof ApiError) throw error;
    throw new ApiError(502, "Payment setup failed. Your order was cancelled and stock was released.");
  }
}

export async function releaseOrder(orderId: string, paymentStatus: "FAILED" = "FAILED") {
  await prisma.$transaction(async (tx) => {
    const changed = await tx.order.updateMany({
      where: { id: orderId, paymentStatus: "PENDING" },
      data: { paymentStatus, status: "CANCELLED" },
    });
    if (!changed.count) return;
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) return;
    for (const item of order.items) {
      if (item.productId) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }
  });
}

export async function confirmStripePayment(orderId: string, sessionId: string) {
  await prisma.order.updateMany({
    where: { id: orderId, paymentSessionId: sessionId, paymentStatus: "PENDING" },
    data: { paymentStatus: "PAID", status: "CONFIRMED" },
  });
}

export function stripe() {
  return stripeClient();
}
