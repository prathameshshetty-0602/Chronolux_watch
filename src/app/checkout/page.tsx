import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = { title: "Secure checkout" };

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=%2Fcheckout");
  const mockMode = process.env.PAYMENT_MODE === "mock" && process.env.NODE_ENV !== "production";
  const paymentAvailable = mockMode || Boolean(process.env.STRIPE_SECRET_KEY);
  return (
    <>
      <section className="page-hero"><div className="container"><span className="eyebrow">Secure checkout</span><h1>Almost yours.</h1><p>Confirm the delivery details and review the order total before continuing to payment.</p></div></section>
      <div className="container"><CheckoutForm mockMode={mockMode} paymentAvailable={paymentAvailable} /></div>
    </>
  );
}
