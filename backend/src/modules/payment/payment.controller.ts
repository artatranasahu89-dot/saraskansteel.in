import { Request, Response } from "express";
import { PaymentService } from "./payment.service";

export class PaymentController {
  static async recordPayment(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      const payment = await PaymentService.recordPayment({
        orderId: req.body.orderId,
        customerId: req.body.customerId,
        amount: Number(req.body.amount || 0),
        paymentMode: req.body.paymentMode,
        source: req.body.source,
        collectedById: user?.id,
        collectedByName: user?.name,
        note: req.body.note,
      });

      return res.status(201).json({
        success: true,
        data: payment,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getPayments(req: Request, res: Response) {
    try {
      const payments = await PaymentService.getPayments({
        customerId: req.query.customerId as string,
        orderId: req.query.orderId as string,
        source: req.query.source as string,
        paymentMode: req.query.paymentMode as string,
        date: req.query.date as string,
        mobile: req.query.mobile as string,
      });

      return res.json({
        success: true,
        data: payments,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}