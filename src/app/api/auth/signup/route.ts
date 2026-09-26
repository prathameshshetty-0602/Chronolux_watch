import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validators";
import { ApiError, jsonError, ok } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const parsed = signupSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError(parsed.error);
    const { name, email, phone, password } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) throw new ApiError(409, "An account with this email already exists.");
    const passwordHash = await hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash,
        cart: { create: {} },
        wishlist: { create: {} },
      },
      select: { id: true, name: true, email: true },
    });
    return ok({ user }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
