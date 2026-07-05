import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import prisma from "../../config/prisma";




export const uploadProfileImage = async (req: any, res: any) => {
  try {
    const user = req.user;

    const customer = await prisma.customer.update({
      where: {
        id: user.id,
      },
      data: {
        profileImage: req.body.profileImage,
      },
    });

    res.json({
      success: true,
      data: customer,
      message: "Profile image updated",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const router = Router();

function generateCustomerNumber() {
  return "C" + Date.now().toString().slice(-5);
}

router.get("/", authenticate, authorize("ADMIN", "STAFF"), async (_req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: customers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get(
  "/mobile/:mobile",
  authenticate,
  authorize("ADMIN", "STAFF"),
  async (req, res) => {
    try {
      const customer = await prisma.customer.findUnique({
        where: { mobile: req.params.mobile },
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      res.json({ success: true, data: customer });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

router.post("/", authenticate, authorize("ADMIN", "STAFF"), async (req, res) => {
  try {
    const customer = await prisma.customer.create({
      data: {
        customerNumber: generateCustomerNumber(),
        mobile: req.body.mobile,
        name: req.body.name,
        dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : null,
        password: hashedPassword,
        address: req.body.address || null,
        email: req.body.email || null,
        gstNumber: req.body.gstNumber || null,
        outstandingAmount: Number(req.body.outstandingAmount || 0),
        createdById: req.body.createdById || null,
      },
    });

    res.status(201).json({ success: true, data: customer });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put("/:id", authenticate, authorize("ADMIN", "STAFF"), async (req, res) => {
  try {
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name,
        mobile: req.body.mobile,
        email: req.body.email || null,
       dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : null,
        address: req.body.address || null,
        gstNumber: req.body.gstNumber || null,
        outstandingAmount: Number(req.body.outstandingAmount || 0),
      },
    });

    res.json({ success: true, data: customer });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete("/:id", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    await prisma.customer.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true, message: "Customer deleted" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;