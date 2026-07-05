import { Router } from "express";
import PDFDocument from "pdfkit";
import prisma from "../../config/prisma";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";

const router = Router();

const money = (v: any) => Number(v || 0).toFixed(2);

router.get(
  "/invoice/:id",
  authenticate,
  authorize("ADMIN", "STAFF","CUSTOMER"),
  async (req, res) => {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: req.params.id },
        include: {
          items: true,
          order: {
            include: {
              customerRecord: true,
              assignedStaff: true,
              transport: true,
            },
          },
        },
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found",
        });
      }
      const user: any = (req as any).user;

if (user.role === "CUSTOMER") {
  if (invoice.order?.customerRecordId !== user.id) {
    return res.status(403).json({
      success: false,
      message: "You can view only your own invoice",
    });
  }
}

      const doc = new PDFDocument({ margin: 40, size: "A4" });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename=${invoice.invoiceNumber}.pdf`
      );

      doc.pipe(res);

      doc.fontSize(22).text("SARSKANA STEEL", { align: "center" });
      doc.fontSize(12).text("Saraskana | Phone: 9438085096", { align: "center" });
      doc.text("Email: SARSKANASTEEL@GMAIL.COM", { align: "center" });

      doc.moveDown();
      doc.fontSize(18).text("TAX INVOICE", { align: "center" });
      doc.moveDown();

      doc.fontSize(11);
      doc.text(`Invoice No: ${invoice.invoiceNumber}`);
      doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
      doc.text(`Order No: ${invoice.order?.orderNumber || "-"}`);

      doc.moveDown();

      doc.text(`Customer: ${invoice.customerName || "-"}`);
      doc.text(`Mobile: ${invoice.customerMobile || "-"}`);
      doc.text(`Address: ${invoice.customerAddress || "-"}`);
      doc.text(`GST: ${invoice.gstNumber || "-"}`);

      doc.moveDown();

      doc.fontSize(12).text("Items", { underline: true });
      doc.moveDown(0.5);

      doc.fontSize(10);
      doc.text("Product", 40, doc.y, { width: 180 });
      doc.text("Qty", 230, doc.y - 12, { width: 60 });
      doc.text("Unit", 290, doc.y - 12, { width: 60 });
      doc.text("Rate", 350, doc.y - 12, { width: 80 });
      doc.text("Amount", 440, doc.y - 12, { width: 100 });

      doc.moveDown();

      invoice.items.forEach((item) => {
        const y = doc.y;
        doc.text(item.productName || "-", 40, y, { width: 180 });
        doc.text(String(item.quantity), 230, y, { width: 60 });
        doc.text(item.unit || "-", 290, y, { width: 60 });
        doc.text(`₹${money(item.rate)}`, 350, y, { width: 80 });
        doc.text(`₹${money(item.amount)}`, 440, y, { width: 100 });
        doc.moveDown();
      });

      doc.moveDown();

      doc.fontSize(11);
      doc.text(`Material Amount: ₹${money(invoice.materialAmount)}`, {
        align: "right",
      });
      doc.text(`Labour Charge: ₹${money(invoice.labourCharge)}`, {
        align: "right",
      });
      doc.text(`Transport Charge: ₹${money(invoice.transportCharge)}`, {
        align: "right",
      });
      doc.text(`Discount: ₹${money(invoice.discountAmount)}`, {
        align: "right",
      });

      doc.moveDown();
      doc.fontSize(15).text(`Grand Total: ₹${money(invoice.finalAmount)}`, {
        align: "right",
      });

      doc.moveDown();

      doc.fontSize(11);
      doc.text(`Assigned Staff: ${invoice.order?.assignedStaff?.name || "-"}`);
      doc.text(`Transport: ${invoice.order?.transport?.name || "-"}`);

      if (invoice.notes) {
        doc.moveDown();
        doc.text(`Notes: ${invoice.notes}`);
      }

      doc.moveDown(3);
      doc.text("Authorized Signature", { align: "right" });

      doc.end();
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

export default router;