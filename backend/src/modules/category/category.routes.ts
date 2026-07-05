import { Router } from "express";
import { CategoryController } from "./category.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";

const router = Router();
router.get("/", authenticate, CategoryController.getAll);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  CategoryController.create
);

router.get("/", CategoryController.getAll);
router.get("/:id", CategoryController.getById);
router.post("/", CategoryController.create);
router.delete("/:id", CategoryController.delete);

export default router;