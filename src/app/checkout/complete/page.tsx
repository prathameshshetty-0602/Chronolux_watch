import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, Clock3 } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { money } from "@/lib/money";

export const metadata: Metadata = { title: "Order status" };
export const dynamic = "force-dynamic";

export default async function CheckoutCompletePage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { order: orderId } = await searchParams;
  const order = orderId ? await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id },
    include: { items: true },
  }) : null;
  return (
    <section className="container section" style={{ maxWidth: 740 }}>
      <div className="data-card" style={{ textAlign: "center", padding: 38 }}>
        {order?.paymentStatus === "PAID" ? <Check size={35} color="#a9c29f" /> : <Clock3 size={35} color="var(--gold)" />}
        <span className="eyebrow" style={{ display: "block", marginTop: 16 }}>ChronoLux order status</span>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 400 }}>{order?.paymentStatus === "PAID" ? "Payment confirmed." : order?.paymentStatus === "TEST_PAID" ? "Development test order placed." : "Payment confirmation pending."}</h1>
        {!order ? <p className="detail-description">We couldn&apos;t find that order in your account.</p> : (
          <>
            <p className="detail-description">Order {order.orderNumber} · {money(Number(order.total))}</p>
            {order.paymentStatus === "TEST_PAID" && <p className="field-hint">This development test order collected no payment. It is labeled as a test order in your order history.</p>}
            {order.paymentStatus === "PENDING" && <p className="field-hint">We haven&apos;t received a payment confirmation yet. Your order remains pending; check your order history in a moment.</p>}
            <div className="order-lines" style={{ margin: "22px 0" }}>{order.items.map((item) => <div className="order-line" key={item.id}><span>{item.productName} × {item.quantity}{item.variant ? " · " + item.variant : ""}</span><span>{money(Number(item.lineTotal))}</span></div>)}</div>
          </>
        )}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}><Link className="button button-gold" href="/orders">View my orders</Link><Link className="button button-outline" href="/watches">Continue shopping</Link></div>
      </div>
    </section>
  );
}
