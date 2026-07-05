import { Router } from "express";
import { PaymentController } from "./payment.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "STAFF"),
  PaymentController.recordPayment
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "STAFF"),
  PaymentController.getPayments
);

export default router;