import { Router } from "express";
import CustomerAuthController from "./customer-auth.controller";

const router = Router();

router.post("/register", CustomerAuthController.register);
router.post("/login", CustomerAuthController.login);
router.post("/forgot-password/verify", CustomerAuthController.verifyCustomer);
router.post("/reset-password", CustomerAuthController.resetPassword);
router.post("/generate-password", CustomerAuthController.generateDefaultPassword);

export default router;