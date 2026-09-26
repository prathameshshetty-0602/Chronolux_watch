import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/auth-guard";
import { ApiError, jsonError, ok } from "@/lib/http";

const maxSize = 5 * 1024 * 1024;
const accepted = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export async function POST(request: Request) {
  try {
    await requireAdmin();
    if (!process.env.BLOB_READ_WRITE_TOKEN) throw new ApiError(503, "Configure Vercel Blob before uploading product photos.");
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new ApiError(400, "Choose an image file.");
    if (!accepted.has(file.type) || file.size > maxSize) {
      throw new ApiError(400, "Use a JPG, PNG, WebP or AVIF image under 5 MB.");
    }
    const result = await put("chronolux/products/" + crypto.randomUUID() + "-" + file.name.replace(/[^a-zA-Z0-9._-]/g, "-"), file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
    });
    return ok({ url: result.url }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
