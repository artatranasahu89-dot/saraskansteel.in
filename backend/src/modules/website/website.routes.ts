import { Router } from "express";
import { WebsiteController } from "./website.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";

const router = Router();

/* Public */
router.get(
  "/owner-message",
  WebsiteController.getOwnerMessage
);

/* Admin */
router.put(
  "/owner-message",
  authenticate,
  authorize("ADMIN"),
  WebsiteController.updateOwnerMessage
);

export default router;