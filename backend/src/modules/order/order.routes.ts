import { Router } from "express";
import { OrderController } from "./order.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "STAFF"),
  OrderController.getOrders
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "STAFF", "CUSTOMER"),
  OrderController.createOrder
);

router.put(
  "/:id/status",
  authenticate,
  authorize("ADMIN", "STAFF"),
  OrderController.updateStatus
);

router.patch(
  "/:id/assign-staff",
  authenticate,
  authorize("ADMIN"),
  OrderController.assignStaff
);

router.patch(
  "/:id/assign-transport",
  authenticate,
  authorize("ADMIN"),
  OrderController.assignTransport
);

router.patch(
  "/:id/accept",
  authenticate,
  authorize("ADMIN"),
  OrderController.acceptOrder
);

router.patch(
  "/:id/cancel",
  authenticate,
  authorize("ADMIN"),
  OrderController.cancelOrder
);

export default router;