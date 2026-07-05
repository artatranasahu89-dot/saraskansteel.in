import { Request, Response } from "express";
import prisma from "../../config/prisma";

export class GalleryController {
  static async getPublicGallery(_req: Request, res: Response) {
    try {
      const data = await prisma.websiteGallery.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          displayOrder: "asc",
        },
      });

      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to load gallery",
      });
    }
  }

  static async getAdminGallery(_req: Request, res: Response) {
    try {
      const data = await prisma.websiteGallery.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to load admin gallery",
      });
    }
  }

  static async createGallery(req: Request, res: Response) {
    try {
      const { title, description, imageUrl, displayOrder, isActive } = req.body;

      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          message: "Image is required",
        });
      }

      const data = await prisma.websiteGallery.create({
        data: {
          title,
          description,
          imageUrl,
          displayOrder: Number(displayOrder) || 1,
          isActive: isActive === false ? false : true,
        },
      });

      return res.json({
        success: true,
        message: "Gallery image added successfully",
        data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to add gallery image",
      });
    }
  }

  static async updateGallery(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, description, imageUrl, displayOrder, isActive } = req.body;

      const data = await prisma.websiteGallery.update({
        where: { id },
        data: {
          title,
          description,
          imageUrl,
          displayOrder: Number(displayOrder) || 1,
          isActive: Boolean(isActive),
        },
      });

      return res.json({
        success: true,
        message: "Gallery image updated successfully",
        data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update gallery image",
      });
    }
  }

  static async deleteGallery(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.websiteGallery.delete({
        where: { id },
      });

      return res.json({
        success: true,
        message: "Gallery image deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete gallery image",
      });
    }
  }
}