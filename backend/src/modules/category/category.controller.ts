import { Request, Response } from "express";
import { CategoryService } from "./category.service";

export class CategoryController {
  static async getAll(_req: Request, res: Response) {
    try {
      const categories = await CategoryService.getAll();

      return res.json({
        success: true,
        data: categories,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const categoryNumber = Number(req.body.categoryNumber);

      if (Number.isNaN(categoryNumber)) {
        return res.status(400).json({
          success: false,
          message: "Category number is required",
        });
      }

      const category = await CategoryService.create({
        categoryNumber,
        name: req.body.name,
        description: req.body.description,
      });

      return res.status(201).json({
        success: true,
        data: category,
      });
    } catch (error: any) {
      console.log("category error:",error.message);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const category = await CategoryService.getById(req.params.id);

      return res.json({
        success: true,
        data: category,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await CategoryService.delete(req.params.id);

      return res.json({
        success: true,
        message: "Category deleted",
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}