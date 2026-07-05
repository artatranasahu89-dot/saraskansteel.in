import prisma from "../../config/prisma";

export class PaymentService {
  static async recordPayment(data: {
    orderId?: string;
    customerId?: string;
    amount: number;
    paymentMode: string;
    source: "INVOICE" | "DELIVERY" | "PAY_BILL";
    collectedById?: string;
    collectedByName?: string;
    note?: string;
  }) {
    const amount = Number(data.amount || 0);

    if (amount <= 0) {
      throw new Error("Payment amount must be greater than 0");
    }

    const createdPayment = await prisma.payment.create({
      data: {
        paymentNumber: `PMT-${Date.now()}`,
        orderId: data.orderId,
        customerId: data.customerId,
        amount,
        paymentMode: data.paymentMode,
        source: data.source,
        collectedById: data.collectedById,
        collectedByName: data.collectedByName,
        note: data.note,
      },
    });

    if (data.orderId) {
      const order = await prisma.order.findUnique({
        where: { id: data.orderId },
        include: {
          invoice: true,
          customerRecord: true,
          payments: true,
        },
      });

      if (!order) throw new Error("Order not found");

      const invoiceValue = Number(order.invoiceValue || order.invoice?.finalAmount || 0);
      const previousOutstanding = Number(order.previousOutstanding || 0);
      const totalPayable = invoiceValue + previousOutstanding;
      const totalPaid = order.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const nowOutstanding = Math.max(totalPayable - totalPaid, 0);

      const paymentStatus =
        nowOutstanding <= 0 && totalPayable > 0
          ? "PAID"
          : totalPaid > 0
          ? "PARTIAL"
          : "PENDING";

      await prisma.order.update({
        where: { id: data.orderId },
        data: {
          invoiceValue,
          previousOutstanding,
          amountPaidToday: totalPaid,
          nowOutstanding,
          totalPaid,
          paymentMethod: data.paymentMode,
          paymentDate: new Date(),
          paymentStatus,
        },
      });

      if (order.customerRecordId) {
        const customer = await prisma.customer.findUnique({
          where: { id: order.customerRecordId },
        });

        if (customer) {
          const earnedPoints = Math.floor(amount / 1000);

          const updatedCustomerOutstanding = Math.max(
            Number(customer.outstandingAmount || 0) - amount,
            0
          );

          await prisma.customer.update({
            where: { id: order.customerRecordId },
            data: {
              outstandingAmount: updatedCustomerOutstanding,
              ...(earnedPoints > 0 && {
                points: {
                  increment: earnedPoints,
                },
              }),
            },
          });

          if (earnedPoints > 0) {
            await prisma.rewardPointLedger.create({
              data: {
                customerId: order.customerRecordId,
                orderId: order.id,
                points: earnedPoints,
                type: "EARNED",
                status: "CREDITED",
                availableDate: new Date(),
                note: `Points earned from payment ₹${amount}`,
              },
            });
          }
        }
      }
    }

    if (!data.orderId && data.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: data.customerId },
      });

      if (!customer) throw new Error("Customer not found");

      const earnedPoints = Math.floor(amount / 1000);

      const newOutstanding = Math.max(
        Number(customer.outstandingAmount || 0) - amount,
        0
      );

      await prisma.customer.update({
        where: { id: data.customerId },
        data: {
          outstandingAmount: newOutstanding,
          ...(earnedPoints > 0 && {
            points: {
              increment: earnedPoints,
            },
          }),
        },
      });

      if (earnedPoints > 0) {
        await prisma.rewardPointLedger.create({
          data: {
            customerId: data.customerId,
            points: earnedPoints,
            type: "EARNED",
            status: "CREDITED",
            availableDate: new Date(),
            note: `Points earned from payment ₹${amount}`,
          },
        });
      }
    }

    return createdPayment;
  }

  static async getPayments(filters: {
    customerId?: string;
    orderId?: string;
    source?: string;
    paymentMode?: string;
    date?: string;
    mobile?: string;
  }) {
    const searchOR: any[] = [];

    if (filters.mobile) {
      searchOR.push(
        { customer: { mobile: { contains: filters.mobile } } },
        { order: { customerRecord: { mobile: { contains: filters.mobile } } } }
      );
    }

    if (filters.customerId) {
      searchOR.push(
        { customer: { customerNumber: { contains: filters.customerId } } },
        { order: { customerRecord: { customerNumber: { contains: filters.customerId } } } }
      );
    }

    return prisma.payment.findMany({
      where: {
        ...(filters.orderId && { orderId: filters.orderId }),
        ...(filters.source && { source: filters.source }),
        ...(filters.paymentMode && { paymentMode: filters.paymentMode }),
        ...(filters.date && {
          createdAt: {
            gte: new Date(filters.date + "T00:00:00.000Z"),
            lte: new Date(filters.date + "T23:59:59.999Z"),
          },
        }),
        ...(searchOR.length > 0 && { OR: searchOR }),
      },
      include: {
        order: {
          include: {
            customerRecord: true,
          },
        },
        customer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}