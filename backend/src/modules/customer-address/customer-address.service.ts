import prisma from "../../config/prisma";

export class CustomerAddressService {
  static async getAddresses(customerId: string) {
    return prisma.customerAddress.findMany({
      where: { customerId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  }

  static async createAddress(customerId: string, data: any) {
    return prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.customerAddress.updateMany({
          where: { customerId },
          data: { isDefault: false },
        });
      }

      const count = await tx.customerAddress.count({
        where: { customerId },
      });

      return tx.customerAddress.create({
        data: {
          customerId,
          label: data.label || `Address ${count + 1}`,
          contactPerson: data.contactPerson || null,
          mobile: data.mobile || null,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || null,
          landmark: data.landmark || null,
          city: data.city || null,
          state: data.state || null,
          pincode: data.pincode || null,
          isDefault: data.isDefault || count === 0,
        },
      });
    });
  }

  static async updateAddress(id: string, customerId: string, data: any) {
    return prisma.customerAddress.update({
      where: { id, customerId },
      data,
    });
  }

  static async deleteAddress(id: string, customerId: string) {
    return prisma.customerAddress.delete({
      where: { id, customerId },
    });
  }

  static async setDefault(id: string, customerId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.customerAddress.updateMany({
        where: { customerId },
        data: { isDefault: false },
      });

      return tx.customerAddress.update({
        where: { id, customerId },
        data: { isDefault: true },
      });
    });
  }
}