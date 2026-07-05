import { Router } from "express";
import { CartController } from "./cart.controller";

const router = Router();
import prisma from "../../config/prisma";


router.get("/:userId", CartController.getCart);

router.post("/add", CartController.addToCart);

export default router;