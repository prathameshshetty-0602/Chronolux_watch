import { prisma } from "@/lib/prisma";
import { emailSchema } from "@/lib/validators";
import { jsonError, ok } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (typeof body.website === "string" && body.website.trim()) return ok({ message: "You're on the list." }, 201);
    const parsed = emailSchema.safeParse(body.email);
    if (!parsed.success) return jsonError(parsed.error);
    await prisma.newsletterSubscriber.upsert({
      where: { email: parsed.data },
      create: { email: parsed.data },
      update: {},
    });
    return ok({ message: "You're on the list. Watch for the next ChronoLux dispatch." }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
