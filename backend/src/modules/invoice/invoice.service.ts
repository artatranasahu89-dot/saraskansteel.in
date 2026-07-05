import prisma from "../../config/prisma";

const round2 = (num: number) => Math.round(num * 100) / 100;

export class InvoiceService {
  static async createInvoice(orderId: string, data: any) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customerRecord: true,
        invoice: true,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.invoice) {
      throw new Error("Invoice already created for this order");
    }

    const items = data.items || [];

    const materialAmount = round2(Number(data.materialAmount || 0));
    const labourCharge = round2(Number(data.labourCharge || 0));
    const transportCharge = round2(Number(data.transportCharge || 0));
    const discountAmount = round2(Number(data.discountAmount || 0));
    const amountPaidAtInvoice = round2(Number(data.amountPaidAtInvoice || 0));

    const notes = data.notes || "";

    const actualWeight =
      data.actualWeight !== undefined ? Number(data.actualWeight) : null;

    const currentInvoiceAmount = round2(
      materialAmount + labourCharge + transportCharge - discountAmount
    );

    const previousOutstanding = round2(
      Number(order.customerRecord?.outstandingAmount || 0)
    );

    const totalPayable = round2(previousOutstanding + currentInvoiceAmount);

    const currentOutstanding = round2(
      Math.max(totalPayable - amountPaidAtInvoice, 0)
    );

    const paymentStatus =
      currentOutstanding <= 0
        ? "PAID"
        : amountPaidAtInvoice > 0
        ? "PARTIAL"
        : "PENDING";

    const invoice = await prisma.$transaction(
      async (tx) => {
      const createdInvoice = await tx.invoice.create({
        data: {
          invoiceNumber: `EST-${Date.now()}`,

          orderId: order.id,

          customerId: order.customerRecordId,

          customerName: order.customerRecord?.name || "",
          customerMobile: order.customerRecord?.mobile || "",
          customerAddress: order.customerRecord?.address || "",
          gstNumber: order.customerRecord?.gstNumber || null,

          materialAmount,
          labourCharge,
          transportCharge,
          discountAmount,
          actualWeight,
          finalAmount: currentInvoiceAmount,
          notes,

          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              productName: item.productName,
              quantity: Number(item.quantity),
              unit: item.unit,
              rate: Number(item.rate),
              amount:
                Number(item.quantity || 0) * Number(item.rate || 0),
            })),
          },
        },

        include: {
          items: true,
        },
      });

      for (const item of items) {
        if (item.productId) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (!product) {
            throw new Error("Product not found");
          }

          if (Number(product.stock || 0) < Number(item.quantity || 0)) {
            throw new Error(`${product.name} stock unavailable`);
          }

          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: Number(item.quantity || 0),
              },
            },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              type: "OUT",
              quantity: Number(item.quantity || 0),
              referenceNo: createdInvoice.invoiceNumber,
              remark: `Stock out for invoice ${createdInvoice.invoiceNumber}`,
            },
          });
        }
      }

      if (order.customerRecordId) {
        await tx.customer.update({
          where: { id: order.customerRecordId },
          data: {
            outstandingAmount: currentOutstanding,
          },
        });
      }

      let paymentRecord = null;

      if (amountPaidAtInvoice > 0 && order.customerRecordId) {
        paymentRecord = await tx.payment.create({
          data: {
            paymentNumber: `PMT-${Date.now()}`,
            orderId: order.id,
            customerId: order.customerRecordId,
            amount: amountPaidAtInvoice,
            paymentMode: data.paymentMode || "CASH",
            source: "INVOICE",
            note: "Paid at invoice creation",
          },
        });
      }

      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "PROCESSING",

          invoiceValue: currentInvoiceAmount,
          previousOutstanding,
          amountPaidToday: amountPaidAtInvoice,
          nowOutstanding: currentOutstanding,

          totalPayable,
          totalPaid: amountPaidAtInvoice,

          paymentStatus,
          paymentMethod: amountPaidAtInvoice > 0 ? data.paymentMode || "CASH" : null,
          paymentDate: amountPaidAtInvoice > 0 ? new Date() : null,
        },
      });

      return {
        invoice: createdInvoice,
        payment: paymentRecord,
      };
    },
     {
    timeout: 20000,
    maxWait: 20000,
  }
  );

    return invoice.invoice;
  }

  static async getInvoice(id: string) {
    return prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
        order: {
          include: {
            customerRecord: true,
            assignedStaff: true,
            transport: true,
            payments: {
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    });
  }

  static async getInvoices() {
    return prisma.invoice.findMany({
      include: {
        items: true,
        order: {
          include: {
            customerRecord: true,
            assignedStaff: true,
            transport: true,
            payments: {
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}