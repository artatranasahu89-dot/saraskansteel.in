import { Request, Response } from "express";
import { DashboardService } from "./dashboard.service";

export class DashboardController {
  static async getStats(
    _req: Request,
    res: Response
  ) {
    try {
      const stats =
        await DashboardService.getStats();

      return res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}