import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const router = Router();
const prisma = new PrismaClient();
const db: any = prisma;

const cleanText = (value: any) => String(value || "").trim();

const cleanMobile = (value: any) => {
  return String(value || "").replace(/\D/g, "").slice(0, 10);
};

const getCustomerDelegate = () => {
  return db.customerRecord || db.customer;
};

const getCustomerModelName = () => {
  const models = (prisma as any)._runtimeDataModel?.models || {};

  if (models.CustomerRecord) return "CustomerRecord";
  if (models.Customer) return "Customer";

  return "";
};

const getCustomerFields = () => {
  const modelName = getCustomerModelName();
  const model = (prisma as any)._runtimeDataModel?.models?.[modelName];

  if (!model?.fields) return new Set<string>();

  return new Set<string>(model.fields.map((field: any) => field.name));
};

const makeCustomerCode = () => {
  return "C" + Math.floor(10000 + Math.random() * 90000);
};

const makePassword = (name: string, dob?: string) => {
  const cleanName =
    cleanText(name).replace(/\s+/g, "").toUpperCase().slice(0, 4) || "CUST";

  if (dob) {
    const date = new Date(dob);

    if (!Number.isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${cleanName}@${day}${month}${year}`;
    }
  }

  return `${cleanName}@1234`;
};

const buildSearchOR = (value: string) => {
  const fields = getCustomerFields();
  const OR: any[] = [];

  if (fields.has("id")) OR.push({ id: value });
  if (fields.has("mobile")) OR.push({ mobile: value });
  if (fields.has("customerNumber")) OR.push({ customerNumber: value });
  if (fields.has("customerId")) OR.push({ customerId: value });
  if (fields.has("customerCode")) OR.push({ customerCode: value });

  return OR;
};

const generateUniqueCustomerCode = async () => {
  const Customer = getCustomerDelegate();

  for (let i = 0; i < 30; i++) {
    const code = makeCustomerCode();
    const OR = buildSearchOR(code);

    if (OR.length === 0) return code;

    const existing = await Customer.findFirst({
      where: { OR },
    });

    if (!existing) return code;
  }

  return "C" + Date.now().toString().slice(-6);
};

router.get("/", async (_req: Request, res: Response) => {
  try {
    const Customer = getCustomerDelegate();
    const fields = getCustomerFields();

    const customers = await Customer.findMany(
      fields.has("createdAt")
        ? {
            orderBy: {
              createdAt: "desc",
            },
          }
        : {}
    );

    return res.json({
      success: true,
      data: customers,
    });
  } catch (error: any) {
    console.log("Load customers error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to load customers",
    });
  }
});

router.get("/mobile/:value", async (req: Request, res: Response) => {
  try {
    const Customer = getCustomerDelegate();

    const value = cleanText(req.params.value);
    const OR = buildSearchOR(value);

    if (OR.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Customer search fields are not available",
      });
    }

    const customer = await Customer.findFirst({
      where: { OR },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.json({
      success: true,
      data: customer,
    });
  } catch (error: any) {
    console.log("Customer search error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Customer search failed",
    });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const Customer = getCustomerDelegate();
    const fields = getCustomerFields();

    const name = cleanText(req.body.name);
    const enteredMobile = cleanMobile(req.body.mobile);

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required",
      });
    }

    if (req.body.mobile && enteredMobile.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be 10 digits, or leave it empty",
      });
    }

    const customerCode = await generateUniqueCustomerCode();

    // If mobile is empty, customer code becomes login ID.
    const loginId = enteredMobile || customerCode;

    const initialPassword = makePassword(
      name,
      cleanText(req.body.dateOfBirth)
    );

    const data: any = {};

    if (fields.has("name")) data.name = name;
    if (fields.has("mobile")) data.mobile = loginId;
    if (fields.has("customerNumber")) data.customerNumber = customerCode;
    if (fields.has("customerId")) data.customerId = customerCode;
    if (fields.has("customerCode")) data.customerCode = customerCode;

    if (fields.has("email") && cleanText(req.body.email)) {
      data.email = cleanText(req.body.email).toLowerCase();
    }

    if (fields.has("dateOfBirth") && cleanText(req.body.dateOfBirth)) {
      data.dateOfBirth = new Date(req.body.dateOfBirth);
    }

    if (fields.has("address") && cleanText(req.body.address)) {
      data.address = cleanText(req.body.address);
    }

    if (fields.has("gstNumber") && cleanText(req.body.gstNumber)) {
      data.gstNumber = cleanText(req.body.gstNumber).toUpperCase();
    }

    if (fields.has("outstandingAmount")) {
      data.outstandingAmount = Number(req.body.outstandingAmount || 0);
    }

    if (fields.has("active")) {
      data.active = true;
    }

    if (fields.has("password")) {
      data.password = await bcrypt.hash(initialPassword, 10);
    }

    const duplicateOR = buildSearchOR(loginId);

    if (duplicateOR.length > 0) {
      const duplicate = await Customer.findFirst({
        where: {
          OR: duplicateOR,
        },
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "Customer already exists",
        });
      }
    }

    const customer = await Customer.create({
      data,
    });

    return res.json({
      success: true,
      message: "Customer added successfully",
      data: customer,
      customer,
      customerNumber: customerCode,
      loginId,
      initialPassword,
    });
  } catch (error: any) {
    console.log("Add customer error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Customer add failed",
    });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const Customer = getCustomerDelegate();
    const fields = getCustomerFields();

    const id = req.params.id;
    const name = cleanText(req.body.name);
    const enteredMobile = cleanMobile(req.body.mobile);

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required",
      });
    }

    if (req.body.mobile && enteredMobile.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be 10 digits, or leave it empty",
      });
    }

    const existing = await Customer.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const loginId =
      enteredMobile ||
      existing.mobile ||
      existing.customerNumber ||
      existing.customerId ||
      existing.customerCode ||
      existing.id;

    const data: any = {};

    if (fields.has("name")) data.name = name;
    if (fields.has("mobile")) data.mobile = loginId;

    if (fields.has("email")) {
      data.email = cleanText(req.body.email)
        ? cleanText(req.body.email).toLowerCase()
        : null;
    }

    if (fields.has("dateOfBirth")) {
      data.dateOfBirth = cleanText(req.body.dateOfBirth)
        ? new Date(req.body.dateOfBirth)
        : null;
    }

    if (fields.has("address")) {
      data.address = cleanText(req.body.address) || null;
    }

    if (fields.has("gstNumber")) {
      data.gstNumber = cleanText(req.body.gstNumber)
        ? cleanText(req.body.gstNumber).toUpperCase()
        : null;
    }

    if (fields.has("outstandingAmount")) {
      data.outstandingAmount = Number(req.body.outstandingAmount || 0);
    }

    const customer = await Customer.update({
      where: { id },
      data,
    });

    return res.json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error: any) {
    console.log("Update customer error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Customer update failed",
    });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const Customer = getCustomerDelegate();

    await Customer.delete({
      where: {
        id: req.params.id,
      },
    });

    return res.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error: any) {
    console.log("Delete customer error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Customer delete failed",
    });
  }
});

export default router;