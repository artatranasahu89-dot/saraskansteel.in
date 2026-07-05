import prisma from "../../config/prisma";

function getDateRange(from?: string, to?: string) {
  if (!from && !to) return {};

  return {
    createdAt: {
      ...(from && { gte: new Date(from + "T00:00:00.000Z") }),
      ...(to && { lte: new Date(to + "T23:59:59.999Z") }),
    },
  };
}

export class ReportsService {
  static async getSummary(from?: string, to?: string) {
    const dateFilter = getDateRange(from, to);

    const orders = await prisma.order.findMany({
      where: dateFilter,
      include: {
        invoice: true,
        payments: true,
      },
    });

    const invoices = await prisma.invoice.findMany({
      where: dateFilter,
    });

    const payments = await prisma.payment.findMany({
      where: dateFilter,
    });

    const totalOrders = orders.length;

    const totalInvoiceValue = invoices.reduce(
      (sum, i) => sum + Number(i.finalAmount || 0),
      0
    );

    const totalCollection = payments.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    );

    const cashCollection = payments
      .filter((p) => p.paymentMode === "CASH")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const upiCollection = payments
      .filter((p) => p.paymentMode === "UPI")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const bankCollection = payments
      .filter((p) => p.paymentMode === "BANK")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const chequeCollection = payments
      .filter((p) => p.paymentMode === "CHEQUE")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const customers = await prisma.customer.findMany();

const totalOutstanding = customers.reduce(
  (sum, c) => sum + Number(c.outstandingAmount || 0),
  0
);

    return {
      totalOrders,
      totalInvoices: invoices.length,
      totalInvoiceValue,
      totalCollection,
      cashCollection,
      upiCollection,
      bankCollection,
      chequeCollection,
      totalOutstanding,
    };
  }

  static async getProductWiseSales(from?: string, to?: string) {
    const dateFilter = getDateRange(from, to);

    const items = await prisma.invoiceItem.findMany({
      where: {
        invoice: dateFilter,
      },
      include: {
        invoice: true,
      },
    });

    const map: any = {};

    items.forEach((item) => {
      const key = item.productName || "Unknown";

      if (!map[key]) {
        map[key] = {
          productName: key,
          quantity: 0,
          amount: 0,
        };
      }

      map[key].quantity += Number(item.quantity || 0);
      map[key].amount += Number(item.amount || 0);
    });

    return Object.values(map);
  }

  static async getStaffWiseReport(from?: string, to?: string) {
    const dateFilter = getDateRange(from, to);

    const orders = await prisma.order.findMany({
      where: dateFilter,
      include: {
        assignedStaff: true,
        invoice: true,
        payments: true,
      },
    });

    const map: any = {};

    orders.forEach((o) => {
      const staffName = o.assignedStaff?.name || "Unassigned";

      if (!map[staffName]) {
        map[staffName] = {
          staffName,
          orders: 0,
          delivered: 0,
          invoiceValue: 0,
          collection: 0,
        };
      }

      map[staffName].orders += 1;

      if (o.status === "DELIVERED") {
        map[staffName].delivered += 1;
      }

      map[staffName].invoiceValue += Number(
        o.invoiceValue || o.invoice?.finalAmount || 0
      );

      map[staffName].collection += o.payments.reduce(
        (sum, p) => sum + Number(p.amount || 0),
        0
      );
    });

    return Object.values(map);
  }

  static async getTransportWiseReport(from?: string, to?: string) {
    const dateFilter = getDateRange(from, to);

    const orders = await prisma.order.findMany({
      where: dateFilter,
      include: {
        transport: true,
        invoice: true,
        payments: true,
      },
    });

    const map: any = {};

    orders.forEach((o) => {
      const transportName = o.transport?.name || "Party / Not Assigned";

      if (!map[transportName]) {
        map[transportName] = {
          transportName,
          totalOrders: 0,
          deliveredOrders: 0,
          transportCharge: 0,
          invoiceValue: 0,
          collection: 0,
          outstanding: 0,
        };
      }

      map[transportName].totalOrders += 1;

      if (o.status === "DELIVERED") {
        map[transportName].deliveredOrders += 1;
      }

      map[transportName].transportCharge += Number(o.transportCharge || 0);
      map[transportName].invoiceValue += Number(
        o.invoiceValue || o.invoice?.finalAmount || 0
      );

      map[transportName].collection += o.payments.reduce(
        (sum, p) => sum + Number(p.amount || 0),
        0
      );

      map[transportName].outstanding += Number(o.nowOutstanding || 0);
    });

    return Object.values(map);
  }

  static async getPaymentModeReport(from?: string, to?: string) {
    const dateFilter = getDateRange(from, to);

    const payments = await prisma.payment.findMany({
      where: dateFilter,
    });

    const map: any = {};

    payments.forEach((p) => {
      const mode = p.paymentMode || "UNKNOWN";

      if (!map[mode]) {
        map[mode] = {
          paymentMode: mode,
          totalAmount: 0,
          count: 0,
        };
      }

      map[mode].totalAmount += Number(p.amount || 0);
      map[mode].count += 1;
    });

    return Object.values(map);
  }

  static async getOutstandingReport() {
    const customers = await prisma.customer.findMany({
      where: {
        outstandingAmount: {
          gt: 0,
        },
      },
      orderBy: {
        outstandingAmount: "desc",
      },
    });

    return customers;
  }

  static async getLowStockReport() {
    return prisma.product.findMany({
      where: {
        stock: {
          lte: 10,
        },
      },
      orderBy: {
        stock: "asc",
      },
    });
  }
}