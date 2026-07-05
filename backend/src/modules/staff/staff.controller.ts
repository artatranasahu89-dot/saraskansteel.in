import { Request, Response } from "express";
import { StaffService } from "./staff.service";

export class StaffController {
  static async getAll(_req: Request, res: Response) {
    const staff = await StaffService.getAll();
    return res.json({ success: true, data: staff });
  }

  static async create(req: Request, res: Response) {
    try {
      const staff = await StaffService.create(req.body);
      return res.status(201).json({ success: true, data: staff });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await StaffService.delete(req.params.id);
      return res.json({ success: true, message: "Staff deleted" });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}