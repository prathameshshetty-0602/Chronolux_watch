import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { money } from "@/lib/money";
import { PackageCheck } from "lucide-react";

export const metadata: Metadata = { title: "Your orders" };
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=%2Forders");
  const orders = await prisma.order.findMany({ where: { userId: session.user.id }, include: { items: true }, orderBy: { createdAt: "desc" } });
  return (
    <>
      <section className="page-hero"><div className="container"><span className="eyebrow">Your ChronoLux account</span><h1>Your orders.</h1><p>Track each order and see its payment and delivery status.</p></div></section>
      <section className="container section">
        {orders.length ? orders.map((order) => (
          <article className="order-card" key={order.id}>
            <div className="order-head"><span><b>{order.orderNumber}</b><br />Placed {order.createdAt.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</span><span className="order-status">{order.status.replaceAll("_", " ")}</span></div>
            {order.paymentStatus === "TEST_PAID" && <p className="field-hint" style={{ color: "var(--gold-light)" }}>Development test order · no payment was collected</p>}
            <div className="order-lines">{order.items.map((item) => <div className="order-line" key={item.id}><span><Link className="inline-link" href={"/product/" + item.productSlug}>{item.productName}</Link> × {item.quantity}{item.variant ? " · " + item.variant : ""}</span><span>{money(Number(item.lineTotal))}</span></div>)}</div>
            <div className="summary-line summary-total"><span>Payment · {order.paymentStatus.replaceAll("_", " ")}</span><strong>{money(Number(order.total))}</strong></div>
            {order.paymentStatus === "PAID" || order.paymentStatus === "TEST_PAID" ? <div style={{ marginTop: 12 }}>{order.items.map((item) => <Link className="text-link" key={item.id} href={"/reviews/" + item.productSlug} style={{ marginRight: 16 }}>Review {item.productName} →</Link>)}</div> : null}
          </article>
        )) : <div className="empty-state"><PackageCheck size={31} color="var(--gold)" /><h3>No orders yet.</h3><p>Your first ChronoLux timepiece is waiting to be found.</p><Link className="button button-gold" href="/watches">Explore watches</Link></div>}
      </section>
    </>
  );
}
