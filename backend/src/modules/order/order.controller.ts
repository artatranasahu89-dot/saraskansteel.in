import { Request, Response } from "express";
import { OrderService } from "./order.service";

export class OrderController {
  static async createOrder(req: Request, res: Response) {
  try {
    const {
      customerId,
      customerRecordId,
      labourType,
      transportCharge,
      deliveryAddressId,
      deliveryAddressSnapshot,
      deliveryLocation,
      deliveryNote,
      note,
      items,
    } = req.body;

    const order = await OrderService.createOrder({
      customerId,
      customerRecordId,
      labourType: labourType || "NONE",
      transportCharge: Number(transportCharge || 0),
      deliveryAddressId,
      deliveryAddressSnapshot,
      deliveryLocation,
      deliveryNote: deliveryNote || note,
      items,
    });

    return res.status(201).json({
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

  static async getOrders(_req: Request, res: Response) {
    try {
      const orders = await OrderService.getOrders();

      return res.json({
        success: true,
        data: orders,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const order = await OrderService.updateStatus(
        req.params.id,
        req.body.status
      );

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

  static async assignStaff(req: Request, res: Response) {
    try {
      const order = await OrderService.assignStaff(
        req.params.id,
        req.body.staffId
      );

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

  static async assignTransport(req: Request, res: Response) {
    try {
      const order = await OrderService.assignTransport(
        req.params.id,
        req.body.transportId
      );

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

  static async acceptOrder(req: Request, res: Response) {
    try {
      const order = await OrderService.acceptOrder(req.params.id);

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

  static async cancelOrder(req: Request, res: Response) {
    try {
      const order = await OrderService.cancelOrder(req.params.id);

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