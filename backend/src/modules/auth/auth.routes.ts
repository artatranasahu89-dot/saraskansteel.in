import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

router.post("/admin-login", AuthController.adminLogin);
router.post("/staff-login", AuthController.staffLogin);

router.post("/customer-send-otp", AuthController.sendOtp);
router.post("/customer-verify-otp", AuthController.verifyOtp);

router.get(
  "/admin-faces",
  authenticate,
  authorize("ADMIN"),
  AuthController.listAdminFaces
);

router.post(
  "/admin-face-register",
  authenticate,
  authorize("ADMIN"),
  AuthController.adminFaceRegister
);

router.delete(
  "/admin-face/:id",
  authenticate,
  authorize("ADMIN"),
  AuthController.deleteFace
);

router.post("/admin-face-login", AuthController.adminFaceLogin);

export default router;