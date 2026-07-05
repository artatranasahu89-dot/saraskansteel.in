import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import prisma from "../../config/prisma";

const router = Router();

router.get("/:id", async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }


    const invoices = await prisma.invoice.findMany({
  where: {
    OR: [
      { customerId: customer.id },
      { customerMobile: customer.mobile },
      { customerName: customer.name },
      {
        order: {
          customerRecordId: customer.id,
        },
      },
    ],
  },
  orderBy: {
    createdAt: "asc",
  },
});
    
const payments = await prisma.payment.findMany({
  where: {
    OR: [
      { customerId: customer.id },
      {
        order: {
          customerRecordId: customer.id,
        },
      },
    ],
  },
  orderBy: {
    createdAt: "asc",
  },
});

    const ledger: any[] = [];

    invoices.forEach((inv) => {
      ledger.push({
        date: inv.createdAt,
        type: "INVOICE",
        reference: inv.invoiceNumber,
        debit: Number(inv.finalAmount || 0),
        credit: 0,
      });
    });

    payments.forEach((pay) => {
      ledger.push({
        date: pay.createdAt,
        type: "PAYMENT",
        reference:pay.paymentNumber || pay.id,
        debit: 0,
        credit: Number(pay.amount || 0),
        paymentMode: pay.paymentMode,
      });
    });

    ledger.sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    );

    let runningBalance = 0;

    const finalLedger = ledger.map((row) => {
      runningBalance += row.debit;
      runningBalance -= row.credit;

      return {
        ...row,
        balance: runningBalance,
      };
    });
    

    res.json({
      success: true,
      customer,
      currentOutstanding: customer.outstandingAmount,
      ledger: finalLedger,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;