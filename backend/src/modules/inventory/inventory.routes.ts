import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import prisma from "../../config/prisma";

const router = Router();

router.get(
  "/movements",
  authenticate,
  authorize("ADMIN"),
  async (_req, res) => {
    const movements = await prisma.stockMovement.findMany({
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: movements });
  }
);

router.post(
  "/stock-in",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    try {
      const { productId, quantity, referenceNo, remark } = req.body;

      const qty = Number(quantity);

      if (qty <= 0) {
        throw new Error("Quantity must be greater than 0");
      }

      await prisma.product.update({
        where: { id: productId },
        data: {
          stock: {
            increment: qty,
          },
        },
      });

      const movement = await prisma.stockMovement.create({
        data: {
          productId,
          type: "IN",
          quantity: qty,
          referenceNo,
          remark,
        },
      });

      res.json({ success: true, data: movement });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
);

router.post(
  "/stock-out",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    try {
      const { productId, quantity, referenceNo, remark } = req.body;

      const qty = Number(quantity);

      if (qty <= 0) {
        throw new Error("Quantity must be greater than 0");
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      if (product.stock < qty) {
        throw new Error("Stock unavailable");
      }

      await prisma.product.update({
        where: { id: productId },
        data: {
          stock: {
            decrement: qty,
          },
        },
      });

      const movement = await prisma.stockMovement.create({
        data: {
          productId,
          type: "OUT",
          quantity: qty,
          referenceNo,
          remark,
        },
      });
      router.get(
  "/report",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    const { productId, type } = req.query;

    const data = await prisma.stockMovement.findMany({
      where: {
        ...(productId
          ? { productId: String(productId) }
          : {}),
        ...(type ? { type: String(type) } : {}),
      },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      data,
    });
  }
);

      res.json({ success: true, data: movement });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
);
router.get(
  "/report",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    try {
      const { productId, type } = req.query;

      const data = await prisma.stockMovement.findMany({
        where: {
          ...(productId ? { productId: String(productId) } : {}),
          ...(type ? { type: String(type) } : {}),
        },
        include: {
          product: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

export default router;