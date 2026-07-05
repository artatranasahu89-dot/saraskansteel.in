import { Request, Response } from "express";
import { CustomerService } from "./customer.service";

export class CustomerController {
  static async getAll(_req: Request, res: Response) {
    try {
      const customers = await CustomerService.getAll();
      return res.json({ success: true, data: customers });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const customer = await CustomerService.create(req.body);
      return res.status(201).json({ success: true, data: customer });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await CustomerService.delete(req.params.id);
      return res.json({ success: true, message: "Customer deleted" });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}