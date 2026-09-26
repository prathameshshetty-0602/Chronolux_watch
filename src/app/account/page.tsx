import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, MessageSquare, PackageCheck, UserRound } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountDashboard } from "@/components/account-dashboard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your account" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=%2Faccount");
  const [user, addresses, reviews, stats, wishlistCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true } }),
    prisma.address.findMany({ where: { userId: session.user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] }),
    prisma.review.findMany({ where: { userId: session.user.id }, include: { product: { select: { name: true, slug: true } } }, orderBy: { updatedAt: "desc" } }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { _count: { select: { orders: true, reviews: true } } },
    }),
    prisma.wishlistItem.count({ where: { wishlist: { userId: session.user.id } } }),
  ]);
  if (!user) redirect("/login");
  return (
    <>
      <section className="page-hero"><div className="container"><span className="eyebrow">Your ChronoLux account</span><h1>Welcome, {user.name.split(" ")[0]}.</h1><p>Your collection, orders and delivery details in one place.</p></div></section>
      <section className="container account-layout">
        <aside className="account-menu">
          <h2>My account</h2>
          <Link href="/account"><UserRound size={15} /> Profile</Link>
          <Link href="/orders"><PackageCheck size={15} /> Orders</Link>
          <Link href="/wishlist"><Heart size={15} /> Wishlist</Link>
          <a href="#addresses"><MapPinIcon /> Addresses</a>
          <a href="#reviews"><MessageSquare size={15} /> Reviews</a>
        </aside>
        <AccountDashboard user={user} addresses={addresses} reviews={reviews} stats={{
          orders: stats?._count.orders ?? 0,
          wishlist: wishlistCount,
          reviews: stats?._count.reviews ?? 0,
        }} />
      </section>
    </>
  );
}

function MapPinIcon() {
  return <span aria-hidden="true" style={{ fontSize: 13 }}>⌖</span>;
}
