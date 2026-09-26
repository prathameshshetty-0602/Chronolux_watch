import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guard";
import { ApiError, jsonError, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/catalog";

export async function GET() {
  try {
    await requireAdmin();
    const [categories, brands] = await Promise.all([
      prisma.category.findMany({ include: { _count: { select: { products: true } } }, orderBy: { name: "asc" } }),
      prisma.brand.findMany({ include: { _count: { select: { products: true } } }, orderBy: { name: "asc" } }),
    ]);
    return ok({ categories, brands });
  } catch (error) {
    return jsonError(error);
  }
}

const schema = z.object({
  kind: z.enum(["category", "brand"]),
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(300).optional(),
});

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return jsonError(parsed.error);
    const slug = slugify(parsed.data.name);
    if (!slug) throw new ApiError(400, "Enter a valid name.");
    const result = parsed.data.kind === "category"
      ? await prisma.category.create({ data: { name: parsed.data.name, slug, description: parsed.data.description } })
      : await prisma.brand.create({ data: { name: parsed.data.name, slug } });
    return ok({ item: result }, 201);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const parsed = schema.extend({ id: z.string().min(1) }).safeParse(await request.json());
    if (!parsed.success) return jsonError(parsed.error);
    const slug = slugify(parsed.data.name);
    if (!slug) throw new ApiError(400, "Enter a valid name.");
    const { kind, id, name, description } = parsed.data;
    const item = kind === "category"
      ? await prisma.category.update({ where: { id }, data: { name, slug, description } })
      : await prisma.brand.update({ where: { id }, data: { name, slug } });
    return ok({ item });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const params = new URL(request.url).searchParams;
    const id = params.get("id");
    const kind = params.get("kind");
    if (!id || !["category", "brand"].includes(kind ?? "")) throw new ApiError(400, "Choose a category or brand.");
    if (kind === "category") await prisma.category.delete({ where: { id } });
    else await prisma.brand.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (error) {
    return jsonError(error);
  }
}
