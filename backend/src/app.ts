import express from "express";
import cors from "cors";

import authRoutes from "./modules/auth/auth.routes";
import productRoutes from "./modules/product/product.routes";
import categoryRoutes from "./modules/category/category.routes";
import cartRoutes from "./modules/cart/cart.routes";
import orderRoutes from "./modules/order/order.routes";
import invoiceRoutes from "./modules/invoice/invoice.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import reportRoutes from "./modules/report/report.routes";
import customerRoutes from "./modules/customer/customer.routes";
import staffRoutes from "./modules/staff/staff.routes";
import path from "path";
import express from "express";
import uploadRoutes from "./modules/upload/upload.routes";
import orderDataRoutes from "./modules/order-data/orderData.routes";
import paymentRoutes from "./modules/payment/payment.routes";
import customerLedgerRoutes from "./modules/customer/customer-ledger.routes";
import deliveryRoutes from "./modules/delivery/delivery.routes";
import inventoryRoutes from "./modules/inventory/inventory.routes";
import supplierRoutes from "./modules/supplier/supplier.routes";
import purchaseRoutes from "./modules/purchase/purchase.routes";
import invoicePdfRoutes from "./modules/pdf/invoice-pdf.routes";
import customerPortalRoutes from "./modules/customer/customer-portal.routes";
import customerAddressRoutes from "./modules/customer-address/customer-address.routes";
import rewardRoutes from "./modules/reward/reward.routes";
import customerAuthRoutes from "./modules/auth/customer-auth.routes";
import offerRoutes from "./modules/offers/offer.routes";
import websiteRoutes from "./modules/website/website.routes";
//import customerOtpRoutes from "./modules/customer/customer-otp.routes";
import galleryRoutes from "./modules/website-gallery/gallery.routes";
import websiteProductsRoutes from "./modules/website-products/websiteProducts.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "STRIDE API Running",
    version: "1.0.0",
  });
});
app.use("/api/website-products", websiteProductsRoutes);
app.use("/api/website-gallery", galleryRoutes);
app.use("/api/website", websiteRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/order-data", orderDataRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/customer-ledger", customerLedgerRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/pdf", invoicePdfRoutes);
app.use("/api/customer-portal", customerPortalRoutes);
app.use("/api/customer-addresses", customerAddressRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/customer-auth", customerAuthRoutes);
//app.use("/api/customer-otp", customerOtpRoutes);
app.use(
  "/uploads",
  express.static(
    path.join(process.cwd(), "uploads")
  )
);
app.use("/api/upload", uploadRoutes);

export default app;