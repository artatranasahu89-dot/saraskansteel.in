import prisma from "../../config/prisma";

export class OfferService {
  static async getAll() {
    return prisma.offerBanner.findMany({
      orderBy: [
        { priority: "asc" },
        { createdAt: "desc" }
      ]
    });
  }

  static async getActive() {
    const now = new Date();

    return prisma.offerBanner.findMany({
      where: {
        isActive: true,
        OR: [
          {
            startDate: null,
            endDate: null
          },
          {
            startDate: {
              lte: now
            },
            endDate: {
              gte: now
            }
          }
        ]
      },
      orderBy: {
        priority: "asc"
      }
    });
  }

  static async create(data: any) {
    return prisma.offerBanner.create({
      data
    });
  }

  static async update(id: string, data: any) {
    return prisma.offerBanner.update({
      where: { id },
      data
    });
  }

  static async delete(id: string) {
    return prisma.offerBanner.delete({
      where: { id }
    });
  }
}