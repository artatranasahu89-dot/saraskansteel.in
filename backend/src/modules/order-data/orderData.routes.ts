import { Router } from "express";
import { OrderDataController } from "./orderData.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import  prisma  from "../../config/prisma";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "STAFF"),
  OrderDataController.getOrderData
);

router.patch(
  "/:id/delivered",
  authenticate,
  authorize("ADMIN", "STAFF"),
  OrderDataController.markDelivered
);

router.patch("/:id/accept", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        status: "PROCESSING",
        deliveryStatus: "PROCESSING",
        deliveryNote: "Admin accepted order",
      },
      include: {
        assignedStaff: true,
        transport: true,
        customerRecord: true,
        invoice: true,
      },
    });

    res.json({
      success: true,
      data: order,
      message: "Order accepted",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

router.patch("/:id/assign-staff", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const { staffId } = req.body;

    if (!staffId) {
      return res.status(400).json({
        success: false,
        message: "Staff is required",
      });
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { assignedStaffId: staffId },
      include: {
        assignedStaff: true,
        transport: true,
        customerRecord: true,
        invoice: true,
      },
    });

    res.json({
      success: true,
      data: order,
      message: "Staff assigned",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

router.patch("/:id/assign-transport", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const { transportId } = req.body;

    if (!transportId) {
      return res.status(400).json({
        success: false,
        message: "Transporter is required",
      });
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { transportId },
      include: {
        assignedStaff: true,
        transport: true,
        customerRecord: true,
        invoice: true,
      },
    });

    res.json({
      success: true,
      data: order,
      message: "Transporter assigned",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

router.patch("/:id/cancel", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        status: "CANCELLED",
        deliveryStatus: "CANCELLED",
      },
      include: {
        assignedStaff: true,
        transport: true,
        customerRecord: true,
        invoice: true,
      },
    });

    res.json({
      success: true,
      data: order,
      message: "Order cancelled",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;