import { Request, Response } from "express";
import { CustomerAddressService } from "./customer-address.service";

export class CustomerAddressController {
  static async list(req: Request, res: Response) {
    const user: any = (req as any).user;
    const data = await CustomerAddressService.getAddresses(user.id);
    res.json({ success: true, data });
  }

  static async listByCustomer(req: Request, res: Response) {
    const data = await CustomerAddressService.getAddresses(req.params.customerId);
    res.json({ success: true, data });
  }

  static async create(req: Request, res: Response) {
    const user: any = (req as any).user;

    if (!req.body.addressLine1) {
      return res.status(400).json({
        success: false,
        message: "Address line 1 is required",
      });
    }

    const customerId =
      user.role === "ADMIN" || user.role === "STAFF"
        ? req.body.customerId
        : user.id;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Customer is required",
      });
    }

    const data = await CustomerAddressService.createAddress(customerId, req.body);
    res.status(201).json({ success: true, data });
  }

  static async update(req: Request, res: Response) {
    const user: any = (req as any).user;

    const customerId =
      user.role === "ADMIN" || user.role === "STAFF"
        ? req.body.customerId
        : user.id;

    const data = await CustomerAddressService.updateAddress(
      req.params.id,
      customerId,
      req.body
    );

    res.json({ success: true, data });
  }

  static async remove(req: Request, res: Response) {
    const user: any = (req as any).user;

    const customerId =
      user.role === "ADMIN" ? req.body.customerId : user.id;

    await CustomerAddressService.deleteAddress(req.params.id, customerId);
    res.json({ success: true, message: "Address deleted" });
  }

  static async setDefault(req: Request, res: Response) {
    const user: any = (req as any).user;

    const customerId =
      user.role === "ADMIN" || user.role === "STAFF"
        ? req.body.customerId
        : user.id;

    const data = await CustomerAddressService.setDefault(req.params.id, customerId);
    res.json({ success: true, data });
  }
}