import prisma from "../../config/prisma";

export class CategoryService {
  static async getAll() {
    
    return prisma.category.findMany({
      where: {
  isActive: true,
},
      orderBy: {
        name: "asc",
      },
    });
    
  }

  static async create(data: {
    categoryNumber: number;
    name: string;
    description?: string;
  }) {
    return prisma.category.create({
      data: {
        categoryNumber: data.categoryNumber,
        name: data.name,
        description: data.description,
      },
    });
  }

  static async getById(id: string) {
    return prisma.category.findUnique({
      where: { id },
    });
  }

  static async delete(id: string) {
    return prisma.category.update({
  where: { id },
  data: { isActive: false },
});
  }
}