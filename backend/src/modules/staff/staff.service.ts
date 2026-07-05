import bcrypt from "bcrypt";
import prisma from "../../config/prisma";

function generateStaffCode() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

export class StaffService {
  static async getAll() {
    return prisma.staff.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  static async create(data: {
    name: string;
    mobile: string;
    password: string;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return prisma.staff.create({
      data: {
        staffCode: generateStaffCode(),
        name: data.name,
        mobile: data.mobile,
        password: hashedPassword,
      },
    });
  }

  static async delete(id: string) {
    return prisma.staff.delete({
      where: { id },
    });
  }
}