import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import prisma from "../../config/prisma";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "STAFF"),
  async (req, res) => {
    try {
      const user: any = (req as any).user;

      const orders = await prisma.order.findMany({
        where:
          user.role === "STAFF"
            ? {
                OR: [
                  { assignedStaffId: user.id },
                  { transportId: user.id },
                ],
              }
            : {},
        include: {
          customerRecord: true,
          assignedStaff: true,
          transport: true,
          invoice: true,
          payments: true,
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

      res.json({ success: true, data: orders });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

router.patch(
  "/:id/out-for-delivery",
  authenticate,
  authorize("ADMIN", "STAFF"),
  async (req, res) => {
    try {
      const order = await prisma.order.update({
        where: { id: req.params.id },
        data: {
          deliveryStatus: "OUT_FOR_DELIVERY",
          status: "OUT_FOR_DELIVERY",
          deliveryLat: req.body.deliveryLat
            ? Number(req.body.deliveryLat)
            : undefined,
          deliveryLng: req.body.deliveryLng
            ? Number(req.body.deliveryLng)
            : undefined,
          deliveryUpdatedAt: new Date(),
          deliveryLocation: req.body.deliveryLocation || null,
          deliveryNote: req.body.deliveryNote || "Delivery started",
          outForDeliveryAt: new Date(),
        },
      });

      res.json({ success: true, data: order });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
);

router.patch(
  "/:id/location",
  authenticate,
  authorize("ADMIN", "STAFF"),
  async (req, res) => {
    try {
      const { deliveryLat, deliveryLng, deliveryLocation, deliveryNote } =
        req.body;

      if (!deliveryLat || !deliveryLng) {
        return res.status(400).json({
          success: false,
          message: "Latitude and longitude are required",
        });
      }

      const order = await prisma.order.update({
        where: { id: req.params.id },
        data: {
          deliveryLat: Number(deliveryLat),
          deliveryLng: Number(deliveryLng),
          deliveryUpdatedAt: new Date(),
          deliveryLocation: deliveryLocation || null,
          deliveryNote: deliveryNote || null,
        },
      });

      res.json({ success: true, data: order });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
);

router.patch(
  "/:id/delivered",
  authenticate,
  authorize("ADMIN", "STAFF"),
  async (req, res) => {
    try {
      const order = await prisma.order.update({
        where: { id: req.params.id },
        data: {
          deliveryStatus: "DELIVERED",
          status: "DELIVERED",
          deliveryLat: req.body.deliveryLat
            ? Number(req.body.deliveryLat)
            : undefined,
          deliveryLng: req.body.deliveryLng
            ? Number(req.body.deliveryLng)
            : undefined,
          deliveryUpdatedAt: new Date(),
          deliveryProofImage: req.body.deliveryProofImage || null,
          deliveryRemark: req.body.deliveryRemark || null,
          deliveryLocation: req.body.deliveryLocation || null,
          deliveryNote: req.body.deliveryNote || "Delivered successfully",
          deliveredAt: new Date(),
        },
      });

      res.json({ success: true, data: order });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
);

router.patch(
  "/:id/failed",
  authenticate,
  authorize("ADMIN", "STAFF"),
  async (req, res) => {
    try {
      const order = await prisma.order.update({
        where: { id: req.params.id },
        data: {
          deliveryStatus: "FAILED",
          status: "DELIVERY_FAILED",
          deliveryLat: req.body.deliveryLat
            ? Number(req.body.deliveryLat)
            : undefined,
          deliveryLng: req.body.deliveryLng
            ? Number(req.body.deliveryLng)
            : undefined,
          deliveryUpdatedAt: new Date(),
          deliveryRemark: req.body.deliveryRemark || null,
          deliveryLocation: req.body.deliveryLocation || null,
          deliveryNote: req.body.deliveryNote || "Delivery failed",
          deliveryFailedAt: new Date(),
        },
      });

      res.json({ success: true, data: order });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
);

router.patch(
  "/:id/pay-later",
  authenticate,
  authorize("ADMIN", "STAFF"),
  async (req, res) => {
    try {
      const order = await prisma.order.findUnique({
        where: { id: req.params.id },
        include: {
          customerRecord: true,
        },
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      const amountToKeepOutstanding =
        Number(order.nowOutstanding || 0) || Number(order.invoiceValue || 0);

      if (order.customerRecordId && amountToKeepOutstanding > 0) {
        await prisma.customer.update({
          where: { id: order.customerRecordId },
          data: {
            outstandingAmount: amountToKeepOutstanding,
          },
        });
      }

      const updatedOrder = await prisma.order.update({
        where: { id: req.params.id },
        data: {
          collectionStatus: "PAY_LATER",
          collectionRemark: req.body.collectionRemark || null,
          expectedPaymentDate: req.body.expectedPaymentDate
            ? new Date(req.body.expectedPaymentDate)
            : null,
          paymentStatus: "PAY_LATER",
          nowOutstanding: amountToKeepOutstanding,
        },
      });

      res.json({ success: true, data: updatedOrder });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

router.patch(
  "/:id/processing",
  authenticate,
  authorize("ADMIN", "STAFF"),
  async (req, res) => {
    try {
      const order = await prisma.order.update({
        where: { id: req.params.id },
        data: {
          status: "PROCESSING",
          deliveryStatus: "PROCESSING",
          deliveryNote: req.body.deliveryNote || "Staff started processing",
        },
      });

      res.json({ success: true, data: order });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

export default router;