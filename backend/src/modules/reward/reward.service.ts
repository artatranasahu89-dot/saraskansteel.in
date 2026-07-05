import prisma from "../../config/prisma";

export class RewardService {
  static async getGifts() {
    return prisma.gift.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  static async createGift(data: any) {
    return prisma.gift.create({
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        pointsRequired: Number(data.pointsRequired || 0),
        stock: Number(data.stock || 0),
        active: data.active ?? true,
      },
    });
  }

  static async updateGift(id: string, data: any) {
    return prisma.gift.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        pointsRequired: Number(data.pointsRequired || 0),
        stock: Number(data.stock || 0),
        active: data.active ?? true,
      },
    });
  }

  static async getMyRedemptions(customerId: string) {
  return prisma.redemption.findMany({
    where: { customerId },
    include: {
      gift: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

  static async getSetting() {
    let setting = await prisma.rewardSetting.findFirst();

    if (!setting) {
      setting = await prisma.rewardSetting.create({
        data: {
          redemptionOpen: true,
          message: "Redemption is open",
        },
      });
    }

    return setting;
  }

  static async updateSetting(data: any) {
    const existing = await prisma.rewardSetting.findFirst();

    if (!existing) {
      return prisma.rewardSetting.create({
        data: {
          redemptionOpen: Boolean(data.redemptionOpen),
          message: data.message,
        },
      });
    }

    return prisma.rewardSetting.update({
      where: { id: existing.id },
      data: {
        redemptionOpen: Boolean(data.redemptionOpen),
        message: data.message,
      },
    });
  }

  static async getRedemptions() {
    return prisma.redemption.findMany({
      include: {
        customer: true,
        gift: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async redeemGift(data: {
    customerId: string;
    giftId: string;
    requestNote?: string;
  }) {
    const setting = await this.getSetting();

    if (!setting.redemptionOpen) {
      throw new Error(setting.message || "Redemption is currently closed");
    }

    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });

   
    if (!customer) throw new Error("Customer not found");
    if (Number(customer.outstandingAmount || 0) > 100) {
  throw new Error("Clear outstanding balance below ₹100 to redeem rewards");
}
    const gift = await prisma.gift.findUnique({
      where: { id: data.giftId },
    });

    if (!gift || !gift.active) throw new Error("Gift not available");
    if (gift.stock <= 0) throw new Error("Gift out of stock");

    if (Number(customer.points || 0) < gift.pointsRequired) {
      throw new Error("Not enough reward points");
    }

    return prisma.redemption.create({
      data: {
        redemptionNo: `RED-${Date.now()}`,
        customerId: data.customerId,
        giftId: data.giftId,
        pointsUsed: gift.pointsRequired,
        requestNote: data.requestNote,
        status: "PENDING",
      },
      include: {
        customer: true,
        gift: true,
      },
    });
  }

  static async approveRedemption(id: string, adminNote?: string) {
    const redemption = await prisma.redemption.findUnique({
      where: { id },
      include: { customer: true, gift: true },
    });

    if (!redemption) throw new Error("Redemption not found");
    if (redemption.status !== "PENDING") {
      throw new Error("Only pending redemption can be approved");
    }

    if (redemption.gift.stock <= 0) {
      throw new Error("Gift out of stock");
    }

    if (redemption.customer.points < redemption.pointsUsed) {
      throw new Error("Customer does not have enough points");
    }

    return prisma.$transaction(async (tx) => {
      await tx.customer.update({
        where: { id: redemption.customerId },
        data: {
          points: {
            decrement: redemption.pointsUsed,
          },
        },
      });

      await tx.gift.update({
        where: { id: redemption.giftId },
        data: {
          stock: {
            decrement: 1,
          },
        },
      });

      return tx.redemption.update({
        where: { id },
        data: {
          status: "APPROVED",
          adminNote,
        },
        include: {
          customer: true,
          gift: true,
        },
      });
    });
  }

  static async rejectRedemption(id: string, adminNote?: string) {
    return prisma.redemption.update({
      where: { id },
      data: {
        status: "REJECTED",
        adminNote,
      },
      include: {
        customer: true,
        gift: true,
      },
    });
  }

  static async markGiven(id: string, adminNote?: string) {
    const redemption = await prisma.redemption.findUnique({
      where: { id },
    });

    if (!redemption) throw new Error("Redemption not found");

    if (redemption.status !== "APPROVED") {
      throw new Error("Only approved redemption can be marked as given");
    }

    return prisma.redemption.update({
      where: { id },
      data: {
        status: "GIVEN",
        adminNote,
        givenAt: new Date(),
      },
      include: {
        customer: true,
        gift: true,
      },
    });
  }
}