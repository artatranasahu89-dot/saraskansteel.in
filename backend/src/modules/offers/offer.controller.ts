import { Request, Response } from "express";
import { OfferService } from "./offer.service";

export class OfferController {
  static async getAll(_req: Request, res: Response) {
    try {
      const data = await OfferService.getAll();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getActive(_req: Request, res: Response) {
    try {
      const data = await OfferService.getActive();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const data = await OfferService.create({
        title: req.body.title,
        subtitle: req.body.subtitle || null,
        description: req.body.description || null,
        imageUrl: req.body.imageUrl || null,
        buttonText: req.body.buttonText || null,
        buttonLink: req.body.buttonLink || null,
        backgroundColor: req.body.backgroundColor || "#2563eb",
        priority: Number(req.body.priority || 1),
        isActive: req.body.isActive ?? true,
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        endDate: req.body.endDate ? new Date(req.body.endDate) : null,
      });

      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const data = await OfferService.update(req.params.id, {
        title: req.body.title,
        subtitle: req.body.subtitle || null,
        description: req.body.description || null,
        imageUrl: req.body.imageUrl || null,
        buttonText: req.body.buttonText || null,
        buttonLink: req.body.buttonLink || null,
        backgroundColor: req.body.backgroundColor || "#2563eb",
        priority: Number(req.body.priority || 1),
        isActive: req.body.isActive ?? true,
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        endDate: req.body.endDate ? new Date(req.body.endDate) : null,
      });

      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await OfferService.delete(req.params.id);
      res.json({ success: true, message: "Offer deleted" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}