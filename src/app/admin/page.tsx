import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "@/components/admin-dashboard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Store administration" };

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=%2Fadmin");
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true, isActive: true } });
  if (!user?.isActive || user.role !== "ADMIN") redirect("/account");
  return <AdminDashboard />;
}
