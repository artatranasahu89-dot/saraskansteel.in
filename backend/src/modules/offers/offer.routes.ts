import { Router } from "express";
import { OfferController } from "./offer.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";

const router = Router();

/* Public - Customer */
router.get(
  "/active",
  OfferController.getActive
);

/* Admin */
router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  OfferController.getAll
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  OfferController.create
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  OfferController.update
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  OfferController.delete
);

export default router;