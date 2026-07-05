import { Router } from "express";
import bcrypt from "bcrypt";
import prisma from "../../config/prisma";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";

const router = Router();

function generateCode(type: string) {
  const prefix = type === "TRANSPORT" ? "TR" : "ST";
  return prefix + Math.floor(10000 + Math.random() * 90000);
}

router.get("/", authenticate, authorize("ADMIN"), async (_req, res) => {
  const staff = await prisma.staff.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.json({
    success: true,
    data: staff,
  });
});

router.post("/", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const type = req.body.type || "STAFF";

    const hashedPassword =
      type === "STAFF" && req.body.password
        ? await bcrypt.hash(req.body.password, 10)
        : null;

    const staff = await prisma.staff.create({
      data: {
        staffCode: generateCode(type),
        type,
        name: req.body.name,
        mobile: req.body.mobile,
        password: hashedPassword,
        role: type === "STAFF" ? "STAFF" : "TRANSPORT",
        active: true,
      },
    });

    res.status(201).json({
      success: true,
      data: staff,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

router.patch("/:id/status", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const staff = await prisma.staff.update({
      where: {
        id: req.params.id,
      },
      data: {
        active: Boolean(req.body.active),
      },
    });

    res.json({
      success: true,
      data: staff,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

router.delete("/:id", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    await prisma.staff.delete({
      where: {
        id: req.params.id,
      },
    });

    res.json({
      success: true,
      message: "Deleted",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;