import { requireAdmin } from "@/lib/auth-guard";
import { jsonError, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();
    const [sales, orders, customers, products, lowStock, recentOrders, categories, monthly] = await Promise.all([
      prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { total: true } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.findMany({ where: { isActive: true, stock: { lte: 5 } }, select: { id: true, name: true, stock: true }, orderBy: { stock: "asc" }, take: 8 }),
      prisma.order.findMany({ include: { user: { select: { name: true, email: true } }, items: true }, orderBy: { createdAt: "desc" }, take: 8 }),
      prisma.category.findMany({ select: { name: true, _count: { select: { products: { where: { isActive: true } } } } }, orderBy: { name: "asc" } }),
      prisma.order.findMany({
        where: { paymentStatus: "PAID", createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1) } },
        select: { total: true, createdAt: true },
      }),
    ]);
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(new Date().getFullYear(), new Date().getMonth() - 5 + index, 1);
      return { key: date.toISOString().slice(0, 7), label: date.toLocaleString("en", { month: "short" }), revenue: 0, orders: 0 };
    });
    for (const order of monthly) {
      const bucket = months.find((month) => month.key === order.createdAt.toISOString().slice(0, 7));
      if (bucket) { bucket.revenue += Number(order.total); bucket.orders += 1; }
    }
    return ok({
      totals: {
        sales: Number(sales._sum.total ?? 0),
        orders,
        customers,
        products,
        lowStock: lowStock.length,
      },
      lowStock,
      recentOrders,
      categories: categories.map((item) => ({ name: item.name, count: item._count.products })),
      monthly,
    });
  } catch (error) {
    return jsonError(error);
  }
}
