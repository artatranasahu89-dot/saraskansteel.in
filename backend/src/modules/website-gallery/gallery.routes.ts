import { Router } from "express";
import { GalleryController } from "./gallery.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";

const router = Router();

router.get("/", GalleryController.getPublicGallery);

router.get(
  "/admin",
  authenticate,
  authorize("ADMIN"),
  GalleryController.getAdminGallery
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  GalleryController.createGallery
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  GalleryController.updateGallery
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  GalleryController.deleteGallery
);

export default router;