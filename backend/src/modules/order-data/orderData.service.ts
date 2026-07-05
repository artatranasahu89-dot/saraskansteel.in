import prisma from "../../config/prisma";

export class OrderDataService {
  static async getOrderData(filters: {
    date?: string;
    mobile?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    transportId?: string;
  }) {
    const orders = await prisma.order.findMany({
      where: {
        ...(filters.date && {
          createdAt: {
            gte: new Date(filters.date + "T00:00:00.000Z"),
            lte: new Date(filters.date + "T23:59:59.999Z"),
          },
        }),

        ...(filters.transportId && {
          transportId: filters.transportId,
        }),

        ...(filters.mobile && {
          customerRecord: {
            mobile: {
              contains: filters.mobile,
            },
          },
        }),
      },

      include: {
  customerRecord: true,
  assignedStaff: true,
  transport: true,
  invoice: true,
  payments: {
    orderBy: {
      createdAt: "asc",
    },
  },
  items: {
    include: {
      product: true,
    },
  },
},

      orderBy: {
        createdAt: "desc",
      },
    });

    return orders
      .map((order) => {
        const invoiceValue = Number(
          order.invoiceValue || order.invoice?.finalAmount || 0
        );

        const previousOutstanding = Number(order.previousOutstanding || 0);

        const totalPayable = invoiceValue + previousOutstanding;

        const totalPaid = order.payments.reduce(
          (sum, p) => sum + Number(p.amount || 0),
          0
        );

        const nowOutstanding = Math.max(totalPayable - totalPaid, 0);

        const paymentStatus =
          nowOutstanding <= 0 && totalPayable > 0
            ? "PAID"
            : totalPaid > 0
            ? "PARTIAL"
            : "PENDING";

        const lastPayment = order.payments[order.payments.length - 1];

        return {
          ...order,
          invoiceValue,
          previousOutstanding,
          totalPayable,
          totalPaid,
          nowOutstanding,
          paymentStatus,
          paymentMethod: lastPayment?.paymentMode || order.paymentMethod || null,
        };
      })
      .filter((order) => {
        const matchPaymentStatus = filters.paymentStatus
          ? order.paymentStatus === filters.paymentStatus
          : true;

        const matchPaymentMethod = filters.paymentMethod
          ? order.paymentMethod === filters.paymentMethod
          : true;

        return matchPaymentStatus && matchPaymentMethod;
      });
  }

  static async markDelivered(orderId: string) {
    return prisma.order.update({
      where: { id: orderId },
      data: {
        status: "DELIVERED",
        deliveredAt: new Date(),
      },
    });
  }
}