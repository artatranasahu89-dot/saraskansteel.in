import { Router } from "express";
import { InvoiceController } from "./invoice.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";

const router = Router();

router.post(
  "/create/:orderId",
  authenticate,
  authorize("ADMIN"),
  InvoiceController.createInvoice
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "STAFF","CUSTOMER"),
  InvoiceController.getInvoices
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "STAFF","CUSTOMER"),
  InvoiceController.getInvoice
);

export default router;