import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import { CustomerAddressController } from "./customer-address.controller";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("CUSTOMER"),
  CustomerAddressController.list
);

router.get(
  "/customer/:customerId",
  authenticate,
  authorize("ADMIN", "STAFF"),
  CustomerAddressController.listByCustomer
);

router.post(
  "/",
  authenticate,
  authorize("CUSTOMER", "ADMIN", "STAFF"),
  CustomerAddressController.create
);

router.put(
  "/:id",
  authenticate,
  authorize("CUSTOMER", "ADMIN", "STAFF"),
  CustomerAddressController.update
);

router.delete(
  "/:id",
  authenticate,
  authorize("CUSTOMER", "ADMIN"),
  CustomerAddressController.remove
);

router.put(
  "/:id/default",
  authenticate,
  authorize("CUSTOMER", "ADMIN", "STAFF"),
  CustomerAddressController.setDefault
);

export default router;