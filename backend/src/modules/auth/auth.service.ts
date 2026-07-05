import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma";
import { env } from "../../config/env";

export class AuthService {
  static async register(name: string, email: string, password: string) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  static async login(data: {
    role: "ADMIN" | "STAFF" | "CUSTOMER";
    email?: string;
    staffId?: string;
    mobile?: string;
    password?: string;
  }) {
    if (data.role === "ADMIN") {
      if (!data.email || !data.password) {
        throw new Error("Email and password required");
      }

      const user = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (!user || user.role !== "ADMIN") {
        throw new Error("Invalid admin credentials");
      }

      const valid = await bcrypt.compare(data.password, user.password);

      if (!valid) {
        throw new Error("Invalid admin credentials");
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      const { password: _, ...safeUser } = user;

      return {
        token,
        user: safeUser,
      };
    }

    if (data.role === "STAFF") {
      if (!data.staffId || !data.password) {
        throw new Error("Staff ID and password required");
      }

      const staff = await prisma.staff.findUnique({
  where: {
    staffCode: data.staffId,
  },
});

      if (!staff) {
        throw new Error("Invalid staff credentials");
      }

      const valid = staff.password
        ? await bcrypt.compare(data.password, staff.password)
        : data.password === staff.mobile;

      if (!valid) {
        throw new Error("Invalid staff credentials");
      }

      const token = jwt.sign(
        { id: staff.id, role: "STAFF" },
        env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return {
        token,
       user: {
  id: staff.id,
  name: staff.name,
  mobile: staff.mobile,
  staffCode: staff.staffCode,
  role: "STAFF",
},
      };
    }

    if (data.role === "CUSTOMER") {
      if (!data.mobile) {
        throw new Error("Mobile number required");
      }

      const customer = await prisma.customer.findUnique({
        where: { mobile: data.mobile },
      });

      if (!customer) {
        throw new Error("Customer not found");
      }

      const token = jwt.sign(
        { id: customer.id, role: "CUSTOMER" },
        env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return {
        token,
        user: {
          id: customer.id,
          name: customer.name,
          mobile: customer.mobile,
          customerNumber: customer.customerNumber,
          role: "CUSTOMER",
        },
      };
    }

    throw new Error("Invalid login role");
  }
}