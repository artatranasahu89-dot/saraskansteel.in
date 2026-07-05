import { Request, Response } from "express";
import { ReportsService } from "./report.service";

export class ReportsController {
  static async summary(req: Request, res: Response) {
    const data = await ReportsService.getSummary(
      req.query.from as string,
      req.query.to as string
    );

    res.json({ success: true, data });
  }

  static async productWise(req: Request, res: Response) {
    const data = await ReportsService.getProductWiseSales(
      req.query.from as string,
      req.query.to as string
    );

    res.json({ success: true, data });
  }

  static async staffWise(req: Request, res: Response) {
    const data = await ReportsService.getStaffWiseReport(
      req.query.from as string,
      req.query.to as string
    );

    res.json({ success: true, data });
  }

  static async transportWise(req: Request, res: Response) {
    const data = await ReportsService.getTransportWiseReport(
      req.query.from as string,
      req.query.to as string
    );

    res.json({ success: true, data });
  }

  static async paymentMode(req: Request, res: Response) {
    const data = await ReportsService.getPaymentModeReport(
      req.query.from as string,
      req.query.to as string
    );

    res.json({ success: true, data });
  }

  static async outstanding(_req: Request, res: Response) {
    const data = await ReportsService.getOutstandingReport();

    res.json({ success: true, data });
  }

  static async lowStock(_req: Request, res: Response) {
    const data = await ReportsService.getLowStockReport();

    res.json({ success: true, data });
  }
}