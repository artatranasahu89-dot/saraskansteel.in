import { Request, Response } from "express";
import { CartService } from "./cart.service";

export class CartController {
  static async getCart(req: Request, res: Response) {
    try {
      const cart = await CartService.getCart(
        req.params.userId
      );

      return res.json({
        success: true,
        data: cart,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async addToCart(req: Request, res: Response) {
    try {
      const { userId, productId, quantity } = req.body;

      const item = await CartService.addToCart(
        userId,
        productId,
        quantity
      );

      return res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}