import { Request, Response } from "express";
import { ProductService } from "./product.service";

export class ProductController {
  static async getAll(_req: Request, res: Response) {
    try {
      const products = await ProductService.getAll();
      return res.json({ success: true, data: products });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const product = await ProductService.create(req.body);
      return res.status(201).json({ success: true, data: product });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const product = await ProductService.getById(req.params.id);
      return res.json({ success: true, data: product });
    } catch (error: any) {
      return res.status(404).json({ success: false, message: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const product = await ProductService.update(req.params.id, req.body);
      return res.json({ success: true, data: product });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
static async adjustStock(req: Request, res: Response) {
  try {
    const product = await ProductService.adjustStock(
      req.params.id,
      req.body.type,
      Number(req.body.quantity)
    );

    return res.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
  static async delete(req: Request, res: Response) {
    try {
      await ProductService.delete(req.params.id);
      return res.json({ success: true, message: "Product deleted" });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}