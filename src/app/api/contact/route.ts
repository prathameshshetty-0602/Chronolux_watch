import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validators";
import { jsonError, ok } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (typeof body.website === "string" && body.website.trim()) return ok({ message: "Thanks for reaching out. Our team will be in touch soon." }, 201);
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) return jsonError(parsed.error);
    await prisma.contactMessage.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        subject: parsed.data.subject,
        message: parsed.data.message,
      },
    });
    return ok({ message: "Thanks for reaching out. Our team will be in touch soon." }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
