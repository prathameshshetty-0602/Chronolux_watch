import { requireUser } from "@/lib/auth-guard";
import { startCheckout } from "@/lib/order";
import { jsonError, ok } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const result = await startCheckout(user.id, await request.json(), request.url);
    return ok(result, 201);
  } catch (error) {
    return jsonError(error);
  }
}
