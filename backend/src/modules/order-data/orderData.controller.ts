import { Request, Response } from "express";
import { OrderDataService } from "./orderData.service";

export class OrderDataController {
  static async getOrderData(req: Request, res: Response) {
    try {
      const data = await OrderDataService.getOrderData({
        date: req.query.date as string,
        mobile: req.query.mobile as string,
        paymentStatus: req.query.paymentStatus as string,
        paymentMethod: req.query.paymentMethod as string,
        transportId: req.query.transportId as string,
      });

      return res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async markDelivered(req: Request, res: Response) {
    try {
      const order = await OrderDataService.markDelivered(req.params.id);

      return res.json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}