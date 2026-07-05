import prisma from "../../config/prisma";

export class ProductService {
  static async getAll() {
    return prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        category: true,
      },
    });
  }

  static async create(data: {
    name: string;
    sku: string;
    description?: string;
    imageUrl?: string;
    price: number;
    stock: number;
    unit: string;
    labourRate: number;
    categoryId: string;
  }) {
    return prisma.product.create({
      data,
    });
  }

  static async getById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  static async update(id: string, data: any) {
    return prisma.product.update({
      where: { id },
      data,
    });
  }

  static async adjustStock(
    id: string,
    type: "IN" | "OUT",
    quantity: number
  ) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (type === "OUT" && product.stock < quantity) {
      throw new Error("Not enough stock");
    }

    return prisma.product.update({
      where: { id },
      data: {
        stock:
          type === "IN"
            ? product.stock + quantity
            : product.stock - quantity,
      },
    });
  }

  static async delete(id: string) {
    return prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }
}