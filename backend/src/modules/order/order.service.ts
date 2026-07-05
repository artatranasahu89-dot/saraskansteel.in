import prisma from "../../config/prisma";

export class OrderService {
  static async createOrder(data: {
  customerId?: string;
  customerRecordId?: string;
  labourType: "NONE" | "LOADING" | "UNLOADING" | "BOTH";
  transportCharge: number;
  deliveryAddressId?: string;
  deliveryAddressSnapshot?: string;
  deliveryLocation?: string;
  deliveryNote?: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}) {
  if (!data.customerRecordId && !data.customerId) {
    throw new Error("Customer is required");
  }

  if (!data.items || data.items.length === 0) {
    throw new Error("Products are required");
  }

  let totalAmount = 0;
  let labourAmount = 0;

  const orderItemsData = [];

  const labourMultiplier =
    data.labourType === "BOTH"
      ? 2
      : data.labourType === "LOADING" || data.labourType === "UNLOADING"
      ? 1
      : 0;

  for (const item of data.items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.stock < Number(item.quantity)) {
      throw new Error(`${product.name} stock unavailable`);
    }

    totalAmount += Number(product.price) * Number(item.quantity);

    labourAmount +=
      Number(item.quantity) *
      Number((product as any).labourRate || 0) *
      labourMultiplier;

    orderItemsData.push({
      productId: product.id,
      quantity: Number(item.quantity),
      unitPrice: Number(product.price),
    });
  }

  return prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}`,
      customerId: data.customerId,
      customerRecordId: data.customerRecordId || data.customerId,
      labourType: data.labourType,
      labourAmount,
      transportCharge: Number(data.transportCharge || 0),
      deliveryAddressId: data.deliveryAddressId || null,
      deliveryAddressSnapshot: data.deliveryAddressSnapshot || data.deliveryLocation || "",
      deliveryLocation: data.deliveryLocation || data.deliveryAddressSnapshot || "",
      deliveryNote: data.deliveryNote || "Order created by admin/staff",
      status: "PENDING",
      deliveryStatus: "PENDING",

      items: {
        create: orderItemsData,
      },
    },
    include: {
      customerRecord: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}
 static async getOrders() {
  return prisma.order.findMany({
    include: {
      customerRecord: true,

      assignedStaff: true,
      transport: true,

      payments: {
        orderBy: {
          createdAt: "desc",
        },
      },

      invoice: true,

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
}

  static async updateStatus(orderId: string, status: any) {
    return prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }

  static async assignStaff(orderId: string, staffId: string) {
    return prisma.order.update({
      where: { id: orderId },
      data: { assignedStaffId: staffId || null },
      include: {
        assignedStaff: true,
      },
    });
  }

  static async assignTransport(orderId: string, transportId: string) {
    return prisma.order.update({
      where: { id: orderId },
      data: { transportId: transportId || null },
      include: {
        transport: true,
      },
    });
  }

  static async acceptOrder(orderId: string) {
    return prisma.order.update({
      where: { id: orderId },
      data: { status: "ACCEPTED" },
    });
  }

  static async cancelOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        invoice: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    return prisma.$transaction(async (tx) => {
      // Stock return ONLY if invoice exists,
      // because stock deduction happens only during invoice creation.
      if (order.invoice) {
        for (const item of order.invoice.items) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  increment: Number(item.quantity),
                },
              },
            });
            await tx.stockMovement.create({
  data: {
    productId: item.productId,
    type: "IN",
    quantity: Number(item.quantity || 0),
    referenceNo: order.orderNumber,
    remark: `Stock returned due to cancelled order ${order.orderNumber}`,
  },
});
          }
        }
      }

      return tx.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
        },
      });
    });
  }
}