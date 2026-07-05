import { Request, Response } from "express";
import { InvoiceService } from "./invoice.service";

export class InvoiceController {
  static async createInvoice(req: Request, res: Response) {
    try {
      const invoice = await InvoiceService.createInvoice(
        req.params.orderId,
        req.body
      );

      return res.status(201).json({
        success: true,
        data: invoice,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getInvoices(_req: Request, res: Response) {
    try {
      const invoices = await InvoiceService.getInvoices();

      return res.json({
        success: true,
        data: invoices,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getInvoice(req: Request, res: Response) {
    try {
      const invoice = await InvoiceService.getInvoice(req.params.id);

      return res.json({
        success: true,
        data: invoice,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }
}