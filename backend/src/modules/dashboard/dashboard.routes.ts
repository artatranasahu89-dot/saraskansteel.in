import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";

const router = Router();

router.get(
  "/stats",
  authenticate,
  authorize("ADMIN"),
  DashboardController.getStats
);

export default router;