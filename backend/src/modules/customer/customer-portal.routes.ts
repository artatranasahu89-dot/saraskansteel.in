import { Router } from "express";
import prisma from "../../config/prisma";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";

const router = Router();

router.get("/my-orders", authenticate, authorize("CUSTOMER"), async (req, res) => {
  const user: any = (req as any).user;

  const orders = await prisma.order.findMany({
    where: {
      customerRecordId: user.id,
    },
    include: {
      customerRecord: true,
      invoice: true,
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ success: true, data: orders });
});

router.get("/my-invoices", authenticate, authorize("CUSTOMER"), async (req, res) => {
  const user: any = (req as any).user;

  const invoices = await prisma.invoice.findMany({
    where: {
      order: {
        customerRecordId: user.id,
      },
    },
    include: {
      items: true,
      order: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ success: true, data: invoices });
});

router.get("/my-payments", authenticate, authorize("CUSTOMER"), async (req, res) => {
  const user: any = (req as any).user;

  const payments = await prisma.payment.findMany({
    where: {
      customerId: user.id,
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ success: true, data: payments });
});

router.get("/summary", authenticate, authorize("CUSTOMER"), async (req, res) => {
  const user: any = (req as any).user;

  const customer = await prisma.customer.findUnique({
    where: { id: user.id },
  });

  const orders = await prisma.order.findMany({
    where: { customerRecordId: user.id },
  });

  const payments = await prisma.payment.findMany({
    where: { customerId: user.id },
  });

  const totalPurchased = orders.reduce(
    (sum, o) => sum + Number(o.invoiceValue || 0),
    0
  );

  const totalPaid = payments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  res.json({
    success: true,
    data: {
      customer,
      totalOrders: orders.length,
      totalPurchased,
      totalPaid,
      outstanding: customer?.outstandingAmount || 0,
      points: customer?.points || 0,
    },
  });
});

router.post("/place-order", authenticate, authorize("CUSTOMER"), async (req, res) => {
  try {
    const user: any = (req as any).user;
    const { items, deliveryAddressId, note } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    if (!deliveryAddressId) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required",
      });
    }

    const address = await prisma.customerAddress.findFirst({
      where: {
        id: deliveryAddressId,
        customerId: user.id,
      },
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Delivery address not found",
      });
    }

    const productIds = items.map((item: any) => item.productId);

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    const addressSnapshot = [
      address.label,
      address.contactPerson,
      address.mobile,
      address.addressLine1,
      address.addressLine2,
      address.landmark,
      address.city,
      address.state,
      address.pincode,
    ]
      .filter(Boolean)
      .join(", ");

    const order = await prisma.order.create({
      data: {
        orderNumber: "ORD-" + Date.now(),
        customerRecordId: user.id,
        status: "PENDING",
        deliveryStatus: "PENDING",
        deliveryAddressSnapshot: addressSnapshot,
        deliveryLocation: addressSnapshot,
        deliveryNote: note || "Customer order request",

        items: {
          create: items.map((item: any) => {
            const product = products.find((p) => p.id === item.productId);

            if (!product) {
              throw new Error("Product not found");
            }

            return {
              productId: item.productId,
              quantity: Number(item.quantity),
              unitPrice: Number(product.price),
            };
          }),
        },
      },
      include: {
        items: true,
        customerRecord: true,
      },
    });

    res.status(201).json({
      success: true,
      data: order,
      message: "Order request placed successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});



export default router;