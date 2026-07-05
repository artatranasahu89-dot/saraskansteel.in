import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma";

const createCustomerNumber = () => {
  return "C" + Math.floor(10000 + Math.random() * 90000);
};

const defaultPasswordFromNameDob = (name: string, dob: string | Date) => {
  const first4 = String(name || "")
    .replace(/\s+/g, "")
    .slice(0, 4)
    .toLowerCase();

  const date = new Date(dob);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");

  return first4 + dd + mm;
};

const signCustomerToken = (customer: any) => {
  return jwt.sign(
    {
      id: customer.id,
      name: customer.name,
      mobile: customer.mobile,
      role: "CUSTOMER",
    },
    process.env.JWT_SECRET || "stride_secret",
    { expiresIn: "7d" }
  );
};

export class CustomerAuthService {
  static async register(data: any) {
    if (!data.name || !data.mobile || !data.dateOfBirth || !data.password) {
      throw new Error("Name, mobile, date of birth and password are required");
    }

    const existing = await prisma.customer.findFirst({
      where: {
        OR: [{ mobile: data.mobile }, { email: data.email || undefined }],
      },
    });

    if (existing) {
      throw new Error("Customer already exists");
    }

    let customerNumber = createCustomerNumber();

    while (
      await prisma.customer.findUnique({
        where: { customerNumber },
      })
    ) {
      customerNumber = createCustomerNumber();
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        mobile: data.mobile,
        email: data.email || null,
        address: data.address || null,
        dateOfBirth: new Date(data.dateOfBirth),
        customerNumber,
        password: hashedPassword,
      },
    });

    const token = signCustomerToken(customer);

    return {
      token,
      user: {
        id: customer.id,
        name: customer.name,
        mobile: customer.mobile,
        email: customer.email,
        role: "CUSTOMER",
        customerNumber: customer.customerNumber,
        profileImage: customer.profileImage,
      },
    };
  }

  static async login(data: any) {
    if (!data.loginId || !data.password) {
      throw new Error("Customer ID/mobile and password are required");
    }

    const customer = await prisma.customer.findFirst({
      where: {
        OR: [{ customerNumber: data.loginId }, { mobile: data.loginId }],
      },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    if (!customer.password) {
      throw new Error("Password not set for this customer");
    }

    const valid = await bcrypt.compare(data.password, customer.password);

    if (!valid) {
      throw new Error("Invalid password");
    }

    const token = signCustomerToken(customer);

    return {
      token,
      user: {
        id: customer.id,
        name: customer.name,
        mobile: customer.mobile,
        email: customer.email,
        role: "CUSTOMER",
        customerNumber: customer.customerNumber,
        profileImage: customer.profileImage,
      },
    };
  }

  static async generateDefaultPassword(customerId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    if (!customer.dateOfBirth) {
      throw new Error("Customer date of birth is required");
    }

    const defaultPassword = defaultPasswordFromNameDob(
      customer.name,
      customer.dateOfBirth
    );

    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        password: hashedPassword,
      },
    });

    return {
      customerNumber: customer.customerNumber,
      defaultPassword,
    };
  }

  static async forgotPasswordVerify(data: any) {
    if (!data.loginId || !data.name || !data.dateOfBirth) {
      throw new Error("Customer ID/mobile, name and date of birth are required");
    }

    const customer = await prisma.customer.findFirst({
      where: {
        OR: [{ customerNumber: data.loginId }, { mobile: data.loginId }],
      },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    const inputName = String(data.name || "").trim().toLowerCase();
    const savedName = String(customer.name || "").trim().toLowerCase();

    if (inputName !== savedName) {
      throw new Error("Customer details do not match");
    }

    if (!customer.dateOfBirth) {
      throw new Error("Date of birth not available for this customer");
    }

    const inputDob = new Date(data.dateOfBirth).toDateString();
    const savedDob = new Date(customer.dateOfBirth).toDateString();

    if (inputDob !== savedDob) {
      throw new Error("Customer details do not match");
    }

    const resetToken = jwt.sign(
      {
        id: customer.id,
        purpose: "CUSTOMER_RESET_PASSWORD",
      },
      process.env.JWT_SECRET || "stride_secret",
      { expiresIn: "10m" }
    );

    return { resetToken };
  }

  static async resetPassword(data: any) {
    if (!data.resetToken || !data.newPassword) {
      throw new Error("Reset token and new password are required");
    }

    const decoded: any = jwt.verify(
      data.resetToken,
      process.env.JWT_SECRET || "stride_secret"
    );

    if (decoded.purpose !== "CUSTOMER_RESET_PASSWORD") {
      throw new Error("Invalid reset token");
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    await prisma.customer.update({
      where: { id: decoded.id },
      data: { password: hashedPassword },
    });

    return true;
  }

  static async changePassword(customerId: string, data: any) {
    if (!data.currentPassword || !data.newPassword) {
      throw new Error("Current password and new password are required");
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer || !customer.password) {
      throw new Error("Customer password not found");
    }

    const valid = await bcrypt.compare(data.currentPassword, customer.password);

    if (!valid) {
      throw new Error("Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    await prisma.customer.update({
      where: { id: customerId },
      data: { password: hashedPassword },
    });

    return true;
  }
}