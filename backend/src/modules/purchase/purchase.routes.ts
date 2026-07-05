import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import prisma from "../../config/prisma";

const router = Router();

function generatePurchaseNumber() {
  return "PUR-" + Date.now().toString().slice(-6);
}

router.get("/", authenticate, authorize("ADMIN"), async (_req, res) => {
  const purchases = await prisma.purchase.findMany({
    include: {
      supplier: true,
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json({
    success: true,
    data: purchases,
  });
});

router.post("/", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const { supplierId, items, note } = req.body;

    const purchase = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;

      for (const item of items) {
        totalAmount += Number(item.quantity) * Number(item.rate);
      }

      const purchase = await tx.purchase.create({
        data: {
          purchaseNumber: generatePurchaseNumber(),
          supplierId,
          totalAmount,
          note,
        },
      });

      for (const item of items) {
        const amount =
          Number(item.quantity) * Number(item.rate);

        await tx.purchaseItem.create({
          data: {
            purchaseId: purchase.id,
            productId: item.productId,
            quantity: Number(item.quantity),
            rate: Number(item.rate),
            amount,
          },
        });

        await tx.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              increment: Number(item.quantity),
            },
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: "IN",
            quantity: Number(item.quantity),
            referenceNo: purchase.purchaseNumber,
            remark: `Purchase Entry ${purchase.purchaseNumber}`,
          },
        });
      }

      return purchase;
    });

    res.status(201).json({
      success: true,
      data: purchase,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;