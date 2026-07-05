import { Request, Response } from "express";
import { RewardService } from "./reward.service";

export class RewardController {
  static async getGifts(req: Request, res: Response) {
    try {
      const data = await RewardService.getGifts();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createGift(req: Request, res: Response) {
    try {
      const data = await RewardService.createGift(req.body);
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async updateGift(req: Request, res: Response) {
    try {
      const data = await RewardService.updateGift(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getRedemptions(req: Request, res: Response) {
    try {
      const data = await RewardService.getRedemptions();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async redeemGift(req: Request, res: Response) {
    try {
      const user: any = (req as any).user;

      const data = await RewardService.redeemGift({
        customerId: req.body.customerId || user.id,
        giftId: req.body.giftId,
        requestNote: req.body.requestNote,
      });

      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async approveRedemption(req: Request, res: Response) {
    try {
      const data = await RewardService.approveRedemption(
        req.params.id,
        req.body.adminNote
      );

      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async rejectRedemption(req: Request, res: Response) {
    try {
      const data = await RewardService.rejectRedemption(
        req.params.id,
        req.body.adminNote
      );

      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async markGiven(req: Request, res: Response) {
    try {
      const data = await RewardService.markGiven(
        req.params.id,
        req.body.adminNote
      );

      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getMyRedemptions(req: Request, res: Response) {
  try {
    const user: any = (req as any).user;

    const data = await RewardService.getMyRedemptions(user.id);

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}


  static async getSetting(req: Request, res: Response) {
  try {
    const data = await RewardService.getSetting();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

static async updateSetting(req: Request, res: Response) {
  try {
    const data = await RewardService.updateSetting(req.body);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}  
}