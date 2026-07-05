import prisma from "../../config/prisma";

export class DashboardService {
  static async getStats() {
    const totalProducts =
      await prisma.product.count();

    const totalCategories =
      await prisma.category.count();

    const totalOrders =
      await prisma.order.count();

    const totalInvoices =
      await prisma.invoice.count();

    const revenue =
      await prisma.order.aggregate({
        _sum: {
          totalAmount: true,
        },
      });

    const lowStockProducts =
      await prisma.product.count({
        where: {
          stock: {
            lte: 10,
          },
        },
      });

    return {
      totalProducts,
      totalCategories,
      totalOrders,
      totalInvoices,
      totalRevenue:
        revenue._sum.totalAmount || 0,
      lowStockProducts,
    };
  }
}