import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import { ReportsController } from "./report.controller";

const router = Router();

router.get(
  "/summary",
  authenticate,
  authorize("ADMIN"),
  ReportsController.summary
);

router.get(
  "/product-wise",
  authenticate,
  authorize("ADMIN"),
  ReportsController.productWise
);

router.get(
  "/staff-wise",
  authenticate,
  authorize("ADMIN"),
  ReportsController.staffWise
);

router.get(
  "/transport-wise",
  authenticate,
  authorize("ADMIN"),
  ReportsController.transportWise
);

router.get(
  "/payment-mode",
  authenticate,
  authorize("ADMIN"),
  ReportsController.paymentMode
);

router.get(
  "/outstanding",
  authenticate,
  authorize("ADMIN"),
  ReportsController.outstanding
);

router.get(
  "/low-stock",
  authenticate,
  authorize("ADMIN"),
  ReportsController.lowStock
);

export default router;