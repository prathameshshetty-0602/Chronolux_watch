import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/http";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new ApiError(401, "Sign in to continue.");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, role: true, isActive: true },
  });
  if (!user?.isActive) throw new ApiError(401, "Your account is unavailable.");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new ApiError(403, "Administrator access is required.");
  return user;
}
