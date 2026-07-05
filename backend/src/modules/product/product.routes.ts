import { Router } from "express";
import { ProductController } from "./product.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";

const router = Router();

router.get("/", authenticate, ProductController.getAll);

router.get("/:id", authenticate, ProductController.getById);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  ProductController.create
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  ProductController.update
);
router.patch(
  "/:id/stock",
  authenticate,
  authorize("ADMIN"),
  ProductController.adjustStock
);


router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  ProductController.delete
);

export default router;