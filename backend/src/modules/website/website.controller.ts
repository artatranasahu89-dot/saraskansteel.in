import { Request, Response } from "express";
import prisma from "../../config/prisma";

export class WebsiteController {

  static async getOwnerMessage(_req: Request, res: Response) {
    try {

      const data = await prisma.ownerMessage.findFirst({
        where: {
          isActive: true,
        },
        orderBy: {
          displayOrder: "asc",
        },
      });

      res.json({
        success: true,
        data,
      });

    } catch (error: any) {

      res.status(500).json({
        success: false,
        message: error.message,
      });

    }
  }

  static async updateOwnerMessage(req: Request, res: Response) {

    try {

      const owner = await prisma.ownerMessage.findFirst();

      let data;

      if (owner) {

        data = await prisma.ownerMessage.update({
          where: {
            id: owner.id,
          },
          data: req.body,
        });

      } else {

        data = await prisma.ownerMessage.create({
          data: req.body,
        });

      }

      res.json({
        success: true,
        data,
      });

    } catch (error: any) {

      res.status(500).json({
        success: false,
        message: error.message,
      });

    }

  }

}