import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import prisma from "../../config/prisma";

const router = Router();

function generateSupplierCode() {
  return "SUP-" + Date.now().toString().slice(-6);
}

router.get("/", authenticate, authorize("ADMIN"), async (_req, res) => {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.json({ success: true, data: suppliers });
});

router.post("/", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const supplier = await prisma.supplier.create({
      data: {
        supplierCode: generateSupplierCode(),
        name: req.body.name,
        mobile: req.body.mobile,
        address: req.body.address || null,
        gstNumber: req.body.gstNumber || null,
      },
    });

    res.status(201).json({ success: true, data: supplier });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put("/:id", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const supplier = await prisma.supplier.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name,
        mobile: req.body.mobile,
        address: req.body.address || null,
        gstNumber: req.body.gstNumber || null,
        active: req.body.active,
      },
    });

    res.json({ success: true, data: supplier });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete("/:id", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    await prisma.supplier.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true, message: "Supplier deleted" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;