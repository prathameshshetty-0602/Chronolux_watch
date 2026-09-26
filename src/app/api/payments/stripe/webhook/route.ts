import { confirmStripePayment, releaseOrder, stripe } from "@/lib/order";
import { ApiError, jsonError, ok } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new ApiError(503, "Stripe webhook is not configured.");
    const signature = request.headers.get("stripe-signature");
    if (!signature) throw new ApiError(400, "Missing payment signature.");
    const rawBody = await request.text();
    let event;
    try {
      event = stripe().webhooks.constructEvent(rawBody, signature, secret);
    } catch {
      throw new ApiError(400, "Invalid payment signature.");
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session.payment_status === "paid" && session.metadata?.orderId) {
        await confirmStripePayment(session.metadata.orderId, session.id);
      }
    } else if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object;
      if (session.metadata?.orderId) await releaseOrder(session.metadata.orderId);
    }
    return ok({ received: true });
  } catch (error) {
    return jsonError(error);
  }
}
