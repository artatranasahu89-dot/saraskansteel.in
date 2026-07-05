import { Router } from "express";
import { RewardController } from "./reward.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";

const router = Router();

router.get(
  "/gifts",
  authenticate,
  RewardController.getGifts
);

router.post(
  "/gifts",
  authenticate,
  authorize("ADMIN"),
  RewardController.createGift
);

router.put(
  "/gifts/:id",
  authenticate,
  authorize("ADMIN"),
  RewardController.updateGift
);

router.get(
  "/redemptions",
  authenticate,
  authorize("ADMIN"),
  RewardController.getRedemptions
);

router.post(
  "/redeem",
  authenticate,
  authorize("CUSTOMER", "STAFF"),
  RewardController.redeemGift
);

router.patch(
  "/:id/approve",
  authenticate,
  authorize("ADMIN"),
  RewardController.approveRedemption
);

router.patch(
  "/:id/reject",
  authenticate,
  authorize("ADMIN"),
  RewardController.rejectRedemption
);

router.patch(
  "/:id/given",
  authenticate,
  authorize("ADMIN"),
  RewardController.markGiven
);

router.get(
  "/setting",
  authenticate,
  RewardController.getSetting
);

router.put(
  "/setting",
  authenticate,
  authorize("ADMIN"),
  RewardController.updateSetting
);

router.get(
  "/my-redemptions",
  authenticate,
  authorize("CUSTOMER"),
  RewardController.getMyRedemptions
);

export default router;