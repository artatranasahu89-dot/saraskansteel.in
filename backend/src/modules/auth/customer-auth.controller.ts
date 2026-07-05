import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const db: any = prisma;

const JWT_SECRET = process.env.JWT_SECRET || "stride_secret_key";

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

const publicCustomer = (customer: any) => {
  const copy = { ...customer };
  delete copy.password;

  return {
    ...copy,
    role: "CUSTOMER",
    customerNumber:
      customer.customerNumber ||
      customer.customerId ||
      customer.customerCode ||
      customer.id,
  };
};

const createCustomerToken = (customer: any) => {
  return jwt.sign(
    {
      id: customer.id,
      role: "CUSTOMER",
      mobile: customer.mobile,
      customerNumber:
        customer.customerNumber ||
        customer.customerId ||
        customer.customerCode ||
        customer.id,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

class CustomerAuthController {
  static async register(req: Request, res: Response) {
    try {
      const Customer = getCustomerDelegate();
      const fields = getCustomerFields();

      const name = cleanText(req.body.name);
      const enteredMobile = cleanMobile(req.body.mobile);
      const password = cleanText(req.body.password);

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Name is required",
        });
      }

      if (req.body.mobile && enteredMobile.length !== 10) {
        return res.status(400).json({
          success: false,
          message: "Mobile number must be 10 digits, or leave it empty",
        });
      }

      if (!password || password.length < 4) {
        return res.status(400).json({
          success: false,
          message: "Password is required",
        });
      }

      const customerCode = await generateUniqueCustomerCode();
      const loginId = enteredMobile || customerCode;

      const duplicateOR = buildSearchOR(loginId);

      if (duplicateOR.length > 0) {
        const existing = await Customer.findFirst({
          where: { OR: duplicateOR },
        });

        if (existing) {
          return res.status(400).json({
            success: false,
            message: "Customer already exists. Please login.",
          });
        }
      }

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
        data.outstandingAmount = 0;
      }

      if (fields.has("active")) {
        data.active = true;
      }

      if (fields.has("password")) {
        data.password = await bcrypt.hash(password, 10);
      }

      const customer = await Customer.create({ data });
      const token = createCustomerToken(customer);

      return res.json({
        success: true,
        message: "Customer registered successfully",
        token,
        user: publicCustomer(customer),
        customer: publicCustomer(customer),
        loginId,
      });
    } catch (error: any) {
      console.log("Customer register error:", error);

      return res.status(500).json({
        success: false,
        message: error?.message || "Customer registration failed",
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const Customer = getCustomerDelegate();
      const fields = getCustomerFields();

      const loginId = cleanText(
        req.body.loginId ||
          req.body.mobile ||
          req.body.customerId ||
          req.body.customerNumber
      );

      const password = cleanText(req.body.password);

      if (!loginId) {
        return res.status(400).json({
          success: false,
          message: "Mobile number or Customer ID is required",
        });
      }

      if (!password) {
        return res.status(400).json({
          success: false,
          message: "Password is required",
        });
      }

      const OR = buildSearchOR(loginId);

      if (OR.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Customer login fields are not available",
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

      if (customer.active === false) {
        return res.status(403).json({
          success: false,
          message: "Customer account is inactive",
        });
      }

      if (!fields.has("password") || !customer.password) {
        return res.status(400).json({
          success: false,
          message: "Password is not set for this customer. Please reset password.",
        });
      }

      const isMatch = await bcrypt.compare(password, customer.password);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid password",
        });
      }

      const token = createCustomerToken(customer);

      return res.json({
        success: true,
        message: "Customer login successful",
        token,
        user: publicCustomer(customer),
        customer: publicCustomer(customer),
      });
    } catch (error: any) {
      console.log("Customer login error:", error);

      return res.status(500).json({
        success: false,
        message: error?.message || "Customer login failed",
      });
    }
  }

  static async verifyCustomer(req: Request, res: Response) {
    try {
      const Customer = getCustomerDelegate();

      const loginId = cleanText(
        req.body.loginId ||
          req.body.mobile ||
          req.body.customerId ||
          req.body.customerNumber
      );

      if (!loginId) {
        return res.status(400).json({
          success: false,
          message: "Mobile number or Customer ID is required",
        });
      }

      const OR = buildSearchOR(loginId);

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
        message: "Customer verified",
        customerId: customer.id,
        customer: publicCustomer(customer),
      });
    } catch (error: any) {
      console.log("Customer verify error:", error);

      return res.status(500).json({
        success: false,
        message: error?.message || "Customer verification failed",
      });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const Customer = getCustomerDelegate();
      const fields = getCustomerFields();

      const loginId = cleanText(
        req.body.loginId ||
          req.body.mobile ||
          req.body.customerId ||
          req.body.customerNumber
      );

      const newPassword = cleanText(
        req.body.newPassword || req.body.password
      );

      if (!loginId) {
        return res.status(400).json({
          success: false,
          message: "Mobile number or Customer ID is required",
        });
      }

      if (!newPassword || newPassword.length < 4) {
        return res.status(400).json({
          success: false,
          message: "New password is required",
        });
      }

      if (!fields.has("password")) {
        return res.status(400).json({
          success: false,
          message: "Password field is not available in customer table",
        });
      }

      const OR = buildSearchOR(loginId);

      const customer = await Customer.findFirst({
        where: { OR },
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await Customer.update({
        where: { id: customer.id },
        data: {
          password: hashedPassword,
        },
      });

      return res.json({
        success: true,
        message: "Password reset successfully",
      });
    } catch (error: any) {
      console.log("Customer reset password error:", error);

      return res.status(500).json({
        success: false,
        message: error?.message || "Password reset failed",
      });
    }
  }

  static async generateDefaultPassword(req: Request, res: Response) {
    try {
      const password = makePassword(req.body.name, req.body.dateOfBirth);

      return res.json({
        success: true,
        password,
        initialPassword: password,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Password generation failed",
      });
    }
  }
}

export default CustomerAuthController;